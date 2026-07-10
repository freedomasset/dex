import { ApolloClient, NormalizedCacheObject } from '@apollo/client'
import gql from 'graphql-tag'
import { Transaction, TransactionType } from 'types'
import { formatTokenSymbol } from 'utils/tokens'

/** 同一笔链上交易里可能有多条 Collect，合并后用于回填 Burn 为 0 的展示 */
function aggregateCollectsByTxHash(
  collects: { transaction: { id: string }; amount0: string; amount1: string; amountUSD: string }[] | undefined,
): Map<string, { amount0: number; amount1: number; amountUSD: number }> {
  const map = new Map<string, { amount0: number; amount1: number; amountUSD: number }>()
  if (!collects?.length) return map
  for (const c of collects) {
    const id = c.transaction.id
    const prev = map.get(id) ?? { amount0: 0, amount1: 0, amountUSD: 0 }
    map.set(id, {
      amount0: prev.amount0 + parseFloat(c.amount0),
      amount1: prev.amount1 + parseFloat(c.amount1),
      amountUSD: prev.amountUSD + parseFloat(c.amountUSD ?? '0'),
    })
  }
  return map
}

const POOL_TRANSACTIONS = gql`
  query transactions($address: Bytes!) {
    mints(first: 100, orderBy: timestamp, orderDirection: desc, where: { pool: $address }, subgraphError: allow) {
      timestamp
      transaction {
        id
      }
      pool {
        token0 {
          id
          symbol
        }
        token1 {
          id
          symbol
        }
      }
      owner
      sender
      origin
      amount0
      amount1
      amountUSD
    }
    swaps(first: 100, orderBy: timestamp, orderDirection: desc, where: { pool: $address }, subgraphError: allow) {
      timestamp
      transaction {
        id
      }
      pool {
        token0 {
          id
          symbol
        }
        token1 {
          id
          symbol
        }
      }
      origin
      amount0
      amount1
      amountUSD
    }
    collects(first: 100, orderBy: timestamp, orderDirection: desc, where: { pool: $address }, subgraphError: allow) {
      timestamp
      transaction {
        id
      }
      pool {
        token0 {
          id
          symbol
        }
        token1 {
          id
          symbol
        }
      }
      owner
      amount0
      amount1
      amountUSD
    }
    burns(first: 100, orderBy: timestamp, orderDirection: desc, where: { pool: $address }, subgraphError: allow) {
      timestamp
      transaction {
        id
      }
      pool {
        token0 {
          id
          symbol
        }
        token1 {
          id
          symbol
        }
      }
      owner
      origin
      amount
      tickLower
      tickUpper
      amount0
      amount1
      amountUSD
    }
  }
`

interface TransactionResults {
  mints: {
    timestamp: string
    transaction: {
      id: string
    }
    pool: {
      token0: {
        id: string
        symbol: string
      }
      token1: {
        id: string
        symbol: string
      }
    }
    origin: string
    amount0: string
    amount1: string
    amountUSD: string
  }[]
  swaps: {
    timestamp: string
    transaction: {
      id: string
    }
    pool: {
      token0: {
        id: string
        symbol: string
      }
      token1: {
        id: string
        symbol: string
      }
    }
    origin: string
    amount0: string
    amount1: string
    amountUSD: string
  }[]
  collects: {
    timestamp: string
    transaction: {
      id: string
    }
    pool: {
      token0: {
        id: string
        symbol: string
      }
      token1: {
        id: string
        symbol: string
      }
    }
    owner: string
    amount0: string
    amount1: string
    amountUSD: string
  }[]
  burns: {
    timestamp: string
    transaction: {
      id: string
    }
    pool: {
      token0: {
        id: string
        symbol: string
      }
      token1: {
        id: string
        symbol: string
      }
    }
    owner: string
    origin: string
    amount: string
    tickLower: string
    tickUpper: string
    amount0: string
    amount1: string
    amountUSD: string
  }[]
}

export async function fetchPoolTransactions(
  address: string,
  client: ApolloClient<NormalizedCacheObject>,
): Promise<{ data: Transaction[] | undefined; error: boolean; loading: boolean }> {
  const { data, error, loading } = await client.query<TransactionResults>({
    query: POOL_TRANSACTIONS,
    variables: {
      address: address,
    },
    fetchPolicy: 'cache-first',
  })

  if (error) {
    return {
      data: undefined,
      error: true,
      loading: false,
    }
  }

  if (loading && !data) {
    return {
      data: undefined,
      error: false,
      loading: true,
    }
  }

  const transactions = parseTransactionsFromResponse(data)

  return { data: transactions, error: false, loading: false }
}

/**
 * 从子图响应中解析交易记录（提取共用逻辑）
 */
function parseTransactionsFromResponse(data: TransactionResults): Transaction[] {
  const collectByTx = aggregateCollectsByTxHash(data.collects)

  const mints = data.mints.map((m) => {
    return {
      type: TransactionType.MINT,
      hash: m.transaction.id,
      timestamp: m.timestamp,
      sender: m.origin,
      token0Symbol: formatTokenSymbol(m.pool.token0.id, m.pool.token0.symbol),
      token1Symbol: formatTokenSymbol(m.pool.token1.id, m.pool.token1.symbol),
      token0Address: m.pool.token0.id,
      token1Address: m.pool.token1.id,
      amountUSD: parseFloat(m.amountUSD),
      amountToken0: parseFloat(m.amount0),
      amountToken1: parseFloat(m.amount1),
    }
  })
  const burns = data.burns.map((m) => {
    const a0 = parseFloat(m.amount0)
    const a1 = parseFloat(m.amount1)
    const usd = parseFloat(m.amountUSD ?? '0')
    const col = collectByTx.get(m.transaction.id)
    const useCollect =
      a0 === 0 &&
      a1 === 0 &&
      col &&
      (col.amount0 !== 0 || col.amount1 !== 0 || col.amountUSD !== 0)

    return {
      type: TransactionType.BURN,
      hash: m.transaction.id,
      timestamp: m.timestamp,
      sender: m.origin || m.owner,
      token0Symbol: formatTokenSymbol(m.pool.token0.id, m.pool.token0.symbol),
      token1Symbol: formatTokenSymbol(m.pool.token1.id, m.pool.token1.symbol),
      token0Address: m.pool.token0.id,
      token1Address: m.pool.token1.id,
      amountUSD: useCollect ? col.amountUSD : usd,
      amountToken0: useCollect ? col.amount0 : a0,
      amountToken1: useCollect ? col.amount1 : a1,
    }
  })

  const swaps = data.swaps.map((m) => {
    return {
      type: TransactionType.SWAP,
      hash: m.transaction.id,
      timestamp: m.timestamp,
      sender: m.origin,
      token0Symbol: formatTokenSymbol(m.pool.token0.id, m.pool.token0.symbol),
      token1Symbol: formatTokenSymbol(m.pool.token1.id, m.pool.token1.symbol),
      token0Address: m.pool.token0.id,
      token1Address: m.pool.token1.id,
      amountUSD: parseFloat(m.amountUSD),
      amountToken0: parseFloat(m.amount0),
      amountToken1: parseFloat(m.amount1),
    }
  })

  return [...mints, ...burns, ...swaps]
}

/**
 * 按时间范围和地址分页拉取该池子全部交易记录（导出用）
 * @param address 池子地址
 * @param startTime 开始时间戳（秒），可选，不传则查全部
 * @param endTime 结束时间戳（秒），可选，不传则查全部
 * @param client Apollo 客户端
 */
export async function fetchAllPoolTransactions(
  address: string,
  startTime: number | undefined,
  endTime: number | undefined,
  client: ApolloClient<NormalizedCacheObject>,
): Promise<Transaction[]> {
  const PAGE_SIZE = 1000
  const allTxMap = new Map<string, Transaction>()

  const hasTimeRange = startTime !== undefined && endTime !== undefined
  const timeFilter = hasTimeRange
    ? `, timestamp_gte: "${startTime}", timestamp_lte: "${endTime}"`
    : ''

  let hasMore = true
  let skip = 0

  while (hasMore) {
    // 为每一页生成查询（可选时间范围筛选）
    const queryWithRange = gql`
      query poolTransactions {
        mints(first: ${PAGE_SIZE}, skip: ${skip}, orderBy: timestamp, orderDirection: desc,
          where: { pool: "${address}"${timeFilter} }, subgraphError: allow) {
          timestamp
          transaction { id }
          pool { token0 { id symbol } token1 { id symbol } }
          owner sender origin
          amount0 amount1 amountUSD
        }
        swaps(first: ${PAGE_SIZE}, skip: ${skip}, orderBy: timestamp, orderDirection: desc,
          where: { pool: "${address}"${timeFilter} }, subgraphError: allow) {
          timestamp
          transaction { id }
          pool { token0 { id symbol } token1 { id symbol } }
          origin
          amount0 amount1 amountUSD
        }
        collects(first: ${PAGE_SIZE}, skip: ${skip}, orderBy: timestamp, orderDirection: desc,
          where: { pool: "${address}"${timeFilter} }, subgraphError: allow) {
          timestamp
          transaction { id }
          pool { token0 { id symbol } token1 { id symbol } }
          owner
          amount0 amount1 amountUSD
        }
        burns(first: ${PAGE_SIZE}, skip: ${skip}, orderBy: timestamp, orderDirection: desc,
          where: { pool: "${address}"${timeFilter} }, subgraphError: allow) {
          timestamp
          transaction { id }
          pool { token0 { id symbol } token1 { id symbol } }
          owner origin amount
          tickLower tickUpper
          amount0 amount1 amountUSD
        }
      }
    `

    const { data, error } = await client.query<TransactionResults>({
      query: queryWithRange,
      fetchPolicy: 'network-only',
    })

    if (error || !data) {
      break
    }

    const pageTransactions = parseTransactionsFromResponse(data)

    if (pageTransactions.length === 0) {
      hasMore = false
      break
    }

    // 用 hash + type 去重
    for (const tx of pageTransactions) {
      const key = `${tx.hash}_${tx.type}`
      if (!allTxMap.has(key)) {
        allTxMap.set(key, tx)
      }
    }

    // 如果有任何一类返回的条数 < PAGE_SIZE，说明拉完了
    const maxCount = Math.max(data.mints.length, data.swaps.length, data.collects.length, data.burns.length)
    if (maxCount < PAGE_SIZE) {
      hasMore = false
    } else {
      skip += PAGE_SIZE
    }
  }

  // 按时间戳降序排列
  return Array.from(allTxMap.values()).sort((a, b) => parseInt(b.timestamp) - parseInt(a.timestamp))
}
