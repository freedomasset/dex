import { useBlocksFromTimestamps } from 'hooks/useBlocksFromTimestamps'
import { useDeltaTimestamps } from 'utils/queries'
import { useState, useEffect, useMemo } from 'react'
import gql from 'graphql-tag'
import { ApolloClient, NormalizedCacheObject } from '@apollo/client'
import { useActiveNetworkVersion, useClients } from 'state/application/hooks'
import { START_BLOCKS } from 'constants/index'

export interface EthPrices {
  current: number
  oneDay: number
  twoDay: number
  week: number
}

export const ETH_PRICES = gql`
  query prices($block24: Int!, $block48: Int, $blockWeek: Int) {
    current: bundles(first: 1, subgraphError: allow) {
      ethPriceUSD
    }
    oneDay: bundles(first: 1, block: { number: $block24 }, subgraphError: allow) {
      ethPriceUSD
    }
    twoDay: bundles(first: 1, block: { number: $block48 }, subgraphError: allow) {
      ethPriceUSD
    }
    oneWeek: bundles(first: 1, block: { number: $blockWeek }, subgraphError: allow) {
      ethPriceUSD
    }
  }
`

interface PricesResponse {
  current: {
    ethPriceUSD: string
  }[]
  oneDay: {
    ethPriceUSD: string
  }[]
  twoDay: {
    ethPriceUSD: string
  }[]
  oneWeek: {
    ethPriceUSD: string
  }[]
}

async function fetchEthPrices(
  blocks: [number, number, number],
  client: ApolloClient<NormalizedCacheObject>,
  minBlock: number,
): Promise<{ data: EthPrices | undefined; error: boolean }> {
  try {
    // 确保区块号不小于最小区块号
    const safeBlock24 = blocks[0] && blocks[0] >= minBlock ? blocks[0] : minBlock
    const safeBlock48 = blocks[1] && blocks[1] >= minBlock ? blocks[1] : safeBlock24
    const safeBlockWeek = blocks[2] && blocks[2] >= minBlock ? blocks[2] : safeBlock24

    const { data, error } = await client.query<PricesResponse>({
      query: ETH_PRICES,
      variables: {
        block24: safeBlock24,
        block48: safeBlock48,
        blockWeek: safeBlockWeek,
      },
    })

    if (error) {
      return {
        error: true,
        data: undefined,
      }
    } else if (data) {
      // 测试网或新子图可能没有 bundle：用 0 作为占位，避免代币表永远卡在「等 ETH 价格」
      if (!data.current || data.current.length === 0) {
        return {
          data: {
            current: 0,
            oneDay: 0,
            twoDay: 0,
            week: 0,
          },
          error: false,
        }
      }

      return {
        data: {
          current: parseFloat(data.current[0]?.ethPriceUSD ?? '0'),
          oneDay: parseFloat(data.oneDay?.[0]?.ethPriceUSD ?? '0'),
          twoDay: parseFloat(data.twoDay?.[0]?.ethPriceUSD ?? '0'),
          week: parseFloat(data.oneWeek?.[0]?.ethPriceUSD ?? '0'),
        },
        error: false,
      }
    } else {
      return {
        data: undefined,
        error: true,
      }
    }
  } catch (e) {
    console.log(e)
    // 子图/网络错误时不阻塞代币列表；USD 价为 0，仍可根据子图 TVL 等展示
    return {
      data: { current: 0, oneDay: 0, twoDay: 0, week: 0 },
      error: false,
    }
  }
}

/**
 * returns eth prices at current, 24h, 48h, and 1w intervals
 */
export function useEthPrices(): EthPrices | undefined {
  const [prices, setPrices] = useState<{ [network: string]: EthPrices | undefined }>()
  const [error, setError] = useState(false)
  const { dataClient } = useClients()

  const [t24, t48, tWeek] = useDeltaTimestamps()
  const { blocks } = useBlocksFromTimestamps([t24, t48, tWeek])

  // index on active network
  const [activeNetwork] = useActiveNetworkVersion()
  const indexedPrices = prices?.[activeNetwork.id]

  // 定义最小区块号
  const MIN_BLOCK = START_BLOCKS[activeNetwork.id]

  useEffect(() => {
    setError(false)
  }, [activeNetwork.id])

  const formattedBlocks = useMemo(() => {
    if (blocks) {
      const formatted = blocks.map((b) => {
        const num = typeof b.number === 'string' ? parseInt(b.number, 10) : Number(b.number)
        // 确保不小于最小区块号
        return Math.max(num, MIN_BLOCK)
      })
      // 如果 blockWeek 无效，使用 block24 作为替代
      if (formatted.length === 2 && formatted[0]) {
        formatted.push(formatted[0]) // 使用 block24 作为 blockWeek
      }
      return formatted.length >= 3 ? formatted : undefined
    }
    return undefined
  }, [blocks, MIN_BLOCK])

  useEffect(() => {
    async function fetch() {
      if (!formattedBlocks || formattedBlocks.length < 3) {
        console.log('[useEthPrices] Waiting for blocks:', { formattedBlocks, blocksCount: blocks?.length })
        return
      }
      console.log('[useEthPrices] Fetching prices with blocks:', formattedBlocks)
      const { data, error: fetchErr } = await fetchEthPrices(formattedBlocks as [number, number, number], dataClient, MIN_BLOCK)
      if (fetchErr) {
        console.log('[useEthPrices] Error fetching prices:', { fetchErr })
        setError(true)
      } else if (data) {
        console.log('[useEthPrices] Prices fetched successfully:', data)
        setPrices((prev) => ({ ...prev, [activeNetwork.id]: data }))
      }
    }
    if (!indexedPrices && !error && formattedBlocks) {
      fetch()
    }
  }, [error, prices, formattedBlocks, blocks, dataClient, indexedPrices, activeNetwork.id, MIN_BLOCK])

  return prices?.[activeNetwork.id]
}
