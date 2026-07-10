import { getPercentChange } from '../../utils/data'
import { ProtocolData } from '../../state/protocol/reducer'
import gql from 'graphql-tag'
import { useQuery, ApolloClient, NormalizedCacheObject } from '@apollo/client'
import { useDeltaTimestamps } from 'utils/queries'
import { useBlocksFromTimestamps } from 'hooks/useBlocksFromTimestamps'
import { useMemo } from 'react'
import { useClients } from 'state/application/hooks'
// import { useTVLAllowed, useTVLOffset } from './derived'
import { POOL_ALLOW_LIST, START_BLOCKS } from '../../constants'
import { useActiveNetworkVersion } from 'state/application/hooks'
import { SupportedNetwork } from 'constants/networks'

// Modified query to fetch specific pools (如果 poolAddresses 为空则获取所有池子)
export const POOLS_DATA = (poolAddresses: string[], block?: string) => {
  const hasPoolFilter = poolAddresses && poolAddresses.length > 0
  const queryString = `
    query pools {
      pools(
        ${hasPoolFilter ? `where: { id_in: ${JSON.stringify(poolAddresses)} }` : ``}
        first: 100
        orderBy: totalValueLockedUSD
        orderDirection: desc
        ${block !== undefined ? `block: { number: ${block}}` : ``}
        subgraphError: allow
      ) {
        id
        txCount
        volumeUSD
        feesUSD
        totalValueLockedUSD
      }
    }
  `
  return gql(queryString)
}

interface PoolResponse {
  pools: {
    id: string
    txCount: string
    volumeUSD: string
    feesUSD: string
    totalValueLockedUSD: string
  }[]
}

export function useFetchProtocolData(
  dataClientOverride?: ApolloClient<NormalizedCacheObject>,
  blockClientOverride?: ApolloClient<NormalizedCacheObject>,
): {
  loading: boolean
  error: boolean
  data: ProtocolData | undefined
  refetch: () => void
} {
  const { dataClient, blockClient } = useClients()
  const activeDataClient = dataClientOverride ?? dataClient
  const activeBlockClient = blockClientOverride ?? blockClient
  const [activeNetwork] = useActiveNetworkVersion()

  // Get allowed pool addresses for current network
  const allowedPools = POOL_ALLOW_LIST[activeNetwork.id] ?? []

  // get blocks from historic timestamps
  const [t24, t48] = useDeltaTimestamps()
  const { blocks, error: blockError } = useBlocksFromTimestamps([t24, t48], activeBlockClient)
  const [block24, block48] = blocks ?? []

  // 定义最小区块号
  const MIN_BLOCK = START_BLOCKS[activeNetwork.id]

  // 安全获取区块号
  // 确保转换为数字类型进行比较
  const block24Num = block24?.number ? (typeof block24.number === 'string' ? parseInt(block24.number, 10) : Number(block24.number)) : 0
  const block48Num = block48?.number ? (typeof block48.number === 'string' ? parseInt(block48.number, 10) : Number(block48.number)) : 0

  const safeBlock24 = block24Num >= MIN_BLOCK ? block24Num.toString() : undefined
  const safeBlock48 = block48Num >= MIN_BLOCK ? block48Num.toString() : undefined

  // fetch all data for allowed pools
  const { loading, error, data, refetch } = useQuery<PoolResponse>(POOLS_DATA(allowedPools), {
    client: activeDataClient,
    fetchPolicy: 'network-only', // 每次查询都从网络获取，不使用缓存
  })

  const {
    loading: loading24,
    error: error24,
    data: data24,
    refetch: refetch24,
  } = useQuery<PoolResponse>(
    POOLS_DATA(allowedPools, safeBlock24), 
    { 
      client: activeDataClient,
      skip: !safeBlock24, // 如果区块号无效，跳过查询
      // fetchPolicy: 'network-only',
      fetchPolicy: 'no-cache',
    }
  )

  const {
    loading: loading48,
    error: error48,
    data: data48,
    refetch: refetch48,
  } = useQuery<PoolResponse>(
    POOLS_DATA(allowedPools, safeBlock48), 
    { 
      client: activeDataClient,
      skip: !safeBlock48,
      // fetchPolicy: 'network-only',
      fetchPolicy: 'no-cache',  // 改这里
    }
  )

  const anyError = Boolean(error || error24 || error48 || blockError)
  const anyLoading = Boolean(loading || loading24 || loading48)

  const formattedData: ProtocolData | undefined = useMemo(() => {
    if (anyError || anyLoading || !data?.pools || !blocks || !data24?.pools?.length) {
      return undefined
    }

    // Aggregate current data
    const aggregate = data.pools.reduce(
      (acc, pool) => {
        acc.txCount += parseFloat(pool.txCount)
        acc.volumeUSD += parseFloat(pool.volumeUSD)
        acc.feesUSD += parseFloat(pool.feesUSD)
        acc.tvlUSD += parseFloat(pool.totalValueLockedUSD)
        return acc
      },
      { txCount: 0, volumeUSD: 0, feesUSD: 0, tvlUSD: 0 },
    )

    // Aggregate 24h ago data
    const aggregate24 = data24?.pools.reduce(
      (acc, pool) => {
        acc.txCount += parseFloat(pool.txCount)
        acc.volumeUSD += parseFloat(pool.volumeUSD)
        acc.feesUSD += parseFloat(pool.feesUSD)
        acc.tvlUSD += parseFloat(pool.totalValueLockedUSD)
        return acc
      },
      { txCount: 0, volumeUSD: 0, feesUSD: 0, tvlUSD: 0 },
    )

    // Aggregate 48h ago data
    const aggregate48 = data48?.pools.reduce(
      (acc, pool) => {
        acc.txCount += parseFloat(pool.txCount)
        acc.volumeUSD += parseFloat(pool.volumeUSD)
        acc.feesUSD += parseFloat(pool.feesUSD)
        acc.tvlUSD += parseFloat(pool.totalValueLockedUSD)
        return acc
      },
      { txCount: 0, volumeUSD: 0, feesUSD: 0, tvlUSD: 0 },
    )

    // Calculate changes
    // volumeUSD: 近 24h 交易量
    const volumeUSD = aggregate24 ? aggregate.volumeUSD - aggregate24.volumeUSD : aggregate.volumeUSD
    // volumeOneWindowAgo: 前一个 24h 窗口交易量（需 48h 数据；不可用时无法比较，返回 0）
    const volumeOneWindowAgo = aggregate24 && aggregate48 ? aggregate24.volumeUSD - aggregate48.volumeUSD : undefined
    const volumeUSDChange = volumeOneWindowAgo
      ? ((volumeUSD - volumeOneWindowAgo) / volumeOneWindowAgo) * 100
      : 0

    // txCount: 近 24h 交易笔数
    const txCount = aggregate24 ? aggregate.txCount - aggregate24.txCount : aggregate.txCount
    const txCountOneWindowAgo = aggregate24 && aggregate48 ? aggregate24.txCount - aggregate48.txCount : undefined
    const txCountChange = txCountOneWindowAgo
      ? getPercentChange(txCount.toString(), txCountOneWindowAgo.toString())
      : 0

    // feesUSD: 近 24h 手续费
    const feesUSD = aggregate24 ? aggregate.feesUSD - aggregate24.feesUSD : aggregate.feesUSD
    const feesOneWindowAgo = aggregate24 && aggregate48 ? aggregate24.feesUSD - aggregate48.feesUSD : undefined
    const feeChange = feesOneWindowAgo
      ? getPercentChange(feesUSD.toString(), feesOneWindowAgo.toString())
      : 0

    return {
      volumeUSD,
      volumeUSDChange,
      tvlUSD: aggregate.tvlUSD,
      tvlUSDChange: getPercentChange(aggregate.tvlUSD.toString(), aggregate24?.tvlUSD?.toString()),
      feesUSD,
      feeChange,
      txCount,
      txCountChange,
    }
  }, [anyError, anyLoading, blocks, data, data24, data48])

  return {
    loading: anyLoading,
    error: anyError,
    data: formattedData,
    refetch: () => {
      refetch()
      if (safeBlock24) refetch24()
      if (safeBlock48) refetch48()
    },
  }
}
