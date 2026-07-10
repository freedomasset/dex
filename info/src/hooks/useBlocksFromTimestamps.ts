import gql from 'graphql-tag'
import { useState, useEffect, useMemo } from 'react'
import { splitQuery } from 'utils/queries'
import { START_BLOCKS } from 'constants/index'
import { useActiveNetworkVersion, useClients } from 'state/application/hooks'
import { ApolloClient, NormalizedCacheObject } from '@apollo/client'

export const GET_BLOCKS = (timestamps: string[]) => {
  let queryString = 'query blocks {'
  queryString += timestamps.map((timestamp) => {
    return `t${timestamp}:blocks(first: 1, orderBy: timestamp, orderDirection: desc, where: { timestamp_lt: ${
      timestamp + 600
    } }) {
        number
      }`
  })
  queryString += '}'
  return gql(queryString)
}

/**
 * for a given array of timestamps, returns block entities
 * @param timestamps
 */
export function useBlocksFromTimestamps(
  timestamps: number[],
  blockClientOverride?: ApolloClient<NormalizedCacheObject>,
): {
  blocks:
    | {
        timestamp: string
        number: any
      }[]
    | undefined
  error: boolean
} {
  const [activeNetwork] = useActiveNetworkVersion()
  const [blocks, setBlocks] = useState<any>()
  const [error, setError] = useState(false)

  const { blockClient } = useClients()
  const activeBlockClient = blockClientOverride ?? blockClient

  // derive blocks based on active network
  const networkBlocks = blocks?.[activeNetwork.id]

  useEffect(() => {
    setError(false)
  }, [activeNetwork.id, activeBlockClient])

  useEffect(() => {
    async function fetchData() {
      const results = await splitQuery(GET_BLOCKS, activeBlockClient, [], timestamps)
      if (results) {
        setBlocks({ ...(blocks ?? {}), [activeNetwork.id]: results })
      } else {
        setError(true)
      }
    }
    if (!networkBlocks && !error) {
      fetchData()
    }
  })

  const blocksFormatted = useMemo(() => {
    if (blocks?.[activeNetwork.id]) {
      const networkBlocks = blocks?.[activeNetwork.id]
      const formatted:any = []
      const deploymentBlock = START_BLOCKS[activeNetwork.id]
      
      const minBlock = deploymentBlock
      
      console.log('[useBlocksFromTimestamps] Processing blocks:', { 
        networkBlocksKeys: Object.keys(networkBlocks),
        timestamps,
        minBlock
      })
      
      // 按照输入的时间戳顺序处理，确保返回顺序正确
      for (let i = 0; i < timestamps.length; i++) {
        const timestamp = timestamps[i]
        const key = `t${timestamp}`
        const blockData = networkBlocks[key]
        
        console.log(`[useBlocksFromTimestamps] Processing timestamp ${i}:`, { 
          timestamp, 
          key, 
          hasData: !!blockData, 
          dataLength: blockData?.length 
        })
        
        if (blockData && blockData.length > 0) {
          // 确保转换为数字（处理字符串类型）
          const rawNumber = blockData[0]['number']
          let number = typeof rawNumber === 'string' ? parseInt(rawNumber, 10) : Number(rawNumber)
          
          console.log(`[useBlocksFromTimestamps] Raw block number for ${key}:`, { rawNumber, number })
          
          // 如果区块号无效或小于起始区块，使用起始区块
          if (isNaN(number) || number <= 0 || number < minBlock) {
            console.log(`[useBlocksFromTimestamps] Block ${number} < minBlock ${minBlock}, using minBlock`)
            number = minBlock
          }
          
          // 确保不小于部署区块
          const adjustedNumber = Math.max(number, minBlock)

          formatted.push({
            timestamp: timestamp.toString(),
            number: adjustedNumber, // 确保返回数字类型
          })
          
          console.log(`[useBlocksFromTimestamps] Added block for ${key}:`, { timestamp: timestamp.toString(), number: adjustedNumber })
        } else {
          // 如果查询返回空数组，使用最小区块号作为默认值
          console.log(`[useBlocksFromTimestamps] No data for ${key}, using minBlock as default`)
          formatted.push({
            timestamp: timestamp.toString(),
            number: minBlock,
          })
        }
      }
      
      console.log('[useBlocksFromTimestamps] Formatted blocks:', formatted)
      return formatted
    }
    console.log('[useBlocksFromTimestamps] No blocks data for network:', activeNetwork.id)
    return undefined
  }, [activeNetwork.id, blocks, timestamps])

  return {
    blocks: blocksFormatted,
    error,
  }
}

/**
 * @notice Fetches block objects for an array of timestamps.
 * @dev blocks are returned in chronological order (ASC) regardless of input.
 * @dev blocks are returned at string representations of Int
 * @dev timestamps are returns as they were provided; not the block time.
 * @param {Array} timestamps
 */
export async function getBlocksFromTimestamps(
  timestamps: number[],
  blockClient: ApolloClient<NormalizedCacheObject>,
  skipCount = 500,
) {
  if (timestamps?.length === 0) {
    return []
  }
  const fetchedData: any = await splitQuery(GET_BLOCKS, blockClient, [], timestamps, skipCount)

  const blocks: any[] = []
  if (fetchedData) {
    for (const t in fetchedData) {
      if (fetchedData[t].length > 0) {
        blocks.push({
          timestamp: t.split('t')[1],
          number: fetchedData[t][0]['number'],
        })
      }
    }
  }
  return blocks
}
