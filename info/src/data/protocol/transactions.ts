import { ApolloClient, NormalizedCacheObject } from '@apollo/client'
import gql from 'graphql-tag'
import { Transaction, TransactionType } from 'types'
import { formatTokenSymbol } from 'utils/tokens'
import { POOL_ALLOW_LIST } from '../../constants'
import { SupportedNetwork } from 'constants/networks'

// 带 pool 过滤的查询
const GLOBAL_TRANSACTIONS_WITH_FILTER = (poolAddresses: string[]) => gql`
  query transactions {
    transactions(
      first: 500, 
      orderBy: timestamp, 
      orderDirection: desc, 
      where: { 
        or: [
          { mints_: { pool_in: ${JSON.stringify(poolAddresses)} } },
          { burns_: { pool_in: ${JSON.stringify(poolAddresses)} } },
          { swaps_: { pool_in: ${JSON.stringify(poolAddresses)} } }
        ]
      },
      subgraphError: allow
    ) {
      id
      timestamp
      mints(where: { pool_in: ${JSON.stringify(poolAddresses)} }) {
        pool { id token0 { id symbol } token1 { id symbol } }
        owner sender origin amount0 amount1 amountUSD
      }
      swaps(where: { pool_in: ${JSON.stringify(poolAddresses)} }) {
        pool { id token0 { id symbol } token1 { id symbol } }
        origin amount0 amount1 amountUSD
      }
      burns(where: { pool_in: ${JSON.stringify(poolAddresses)} }) {
        pool { id token0 { id symbol } token1 { id symbol } }
        owner origin amount0 amount1 amountUSD
      }
    }
  }
`

// 不带 pool 过滤的查询（用于空 ALLOW_LIST）
const GLOBAL_TRANSACTIONS_NO_FILTER = gql`
  query transactions {
    transactions(
      first: 500, 
      orderBy: timestamp, 
      orderDirection: desc,
      subgraphError: allow
    ) {
      id
      timestamp
      mints {
        pool { id token0 { id symbol } token1 { id symbol } }
        owner sender origin amount0 amount1 amountUSD
      }
      swaps {
        pool { id token0 { id symbol } token1 { id symbol } }
        origin amount0 amount1 amountUSD
      }
      burns {
        pool { id token0 { id symbol } token1 { id symbol } }
        owner origin amount0 amount1 amountUSD
      }
    }
  }
`

type TransactionEntry = {
  timestamp: string
  id: string
  mints: {
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
  burns: {
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
    amount0: string
    amount1: string
    amountUSD: string
  }[]
}

interface TransactionResults {
  transactions: TransactionEntry[]
}

export async function fetchTopTransactions(
  client: ApolloClient<NormalizedCacheObject>,
  networkId: SupportedNetwork,
): Promise<Transaction[] | undefined> {
  try {
    const allowedPools = POOL_ALLOW_LIST[networkId] ?? []
    const hasPoolFilter = allowedPools.length > 0

    // 根据是否有 pool 过滤条件选择不同的查询
    const { data, error, loading } = await client.query<TransactionResults>({
      query: hasPoolFilter ? GLOBAL_TRANSACTIONS_WITH_FILTER(allowedPools) : GLOBAL_TRANSACTIONS_NO_FILTER,
      fetchPolicy: 'cache-first',
    })

    if (error || loading || !data) {
      return undefined
    }

    const formatted = data.transactions.reduce((accum: Transaction[], t: TransactionEntry) => {
      const mintEntries = t.mints.map((m) => {
        return {
          type: TransactionType.MINT,
          hash: t.id,
          timestamp: t.timestamp,
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
      const burnEntries = t.burns.map((m) => {
        return {
          type: TransactionType.BURN,
          hash: t.id,
          timestamp: t.timestamp,
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

      const swapEntries = t.swaps.map((m) => {
        return {
          hash: t.id,
          type: TransactionType.SWAP,
          timestamp: t.timestamp,
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
      accum = [...accum, ...mintEntries, ...burnEntries, ...swapEntries]
      return accum
    }, [])

    return formatted
  } catch {
    return undefined
  }
}
