import { useProtocolData, useProtocolChartData, useProtocolTransactions } from './hooks'
import { useEffect, useRef } from 'react'
import { useFetchProtocolData } from 'data/protocol/overview'
import { useFetchGlobalChartData } from 'data/protocol/chart'
import { fetchTopTransactions } from 'data/protocol/transactions'
import { useClients } from 'state/application/hooks'
import { useActiveNetworkVersion } from 'state/application/hooks'

// 比较两个对象是否相等（浅比较）
function isEqual(a: any, b: any): boolean {
  if (a === b) return true
  if (!a || !b) return false
  if (typeof a !== 'object' || typeof b !== 'object') return false
  
  const keysA = Object.keys(a)
  const keysB = Object.keys(b)
  
  if (keysA.length !== keysB.length) return false
  
  for (const key of keysA) {
    if (a[key] !== b[key]) return false
  }
  
  return true
}

// 比较数组是否相等
function isArrayEqual(a: any[] | undefined, b: any[] | undefined): boolean {
  if (a === b) return true
  if (!a || !b) return false
  if (a.length !== b.length) return false
  
  return a.every((item, index) => isEqual(item, b[index]))
}

export default function Updater(): null {
  // client for data fetching
  const { dataClient } = useClients()
  const [activeNetwork] = useActiveNetworkVersion()
  const [protocolData, updateProtocolData] = useProtocolData()
  const { data: fetchedProtocolData, error, loading, refetch: refetchProtocolData } = useFetchProtocolData()

  const [chartData, updateChartData] = useProtocolChartData()
  const { data: fetchedChartData, error: chartError, refetch: refetchChartData } = useFetchGlobalChartData()

  const [transactions, updateTransactions] = useProtocolTransactions()

  // 使用 ref 来跟踪上次更新的数据，避免重复更新
  const lastProtocolDataRef = useRef<typeof fetchedProtocolData>()
  const lastChartDataRef = useRef<typeof fetchedChartData>()
  const lastTransactionsRef = useRef<typeof transactions>()

  // update overview data if available and not set
  useEffect(() => {
    if (protocolData === undefined && fetchedProtocolData && !loading && !error) {
      updateProtocolData(fetchedProtocolData)
      lastProtocolDataRef.current = fetchedProtocolData
    }
  }, [error, fetchedProtocolData, loading, protocolData, updateProtocolData])

  // update global chart data if available and not set
  useEffect(() => {
    if (chartData === undefined && fetchedChartData && !chartError) {
      updateChartData(fetchedChartData)
      lastChartDataRef.current = fetchedChartData
    }
  }, [chartData, chartError, fetchedChartData, updateChartData])

  // 初始加载交易数据
  useEffect(() => {
    const fetchTransactions = async () => {
      const data = await fetchTopTransactions(dataClient, activeNetwork.id)
      if (data) {
        updateTransactions(data)
        lastTransactionsRef.current = data
      }
    }
    if (!transactions) {
      fetchTransactions()
    }
  }, [transactions, updateTransactions, dataClient, activeNetwork.id])

  // 定期刷新数据（每 30 秒）
  useEffect(() => {
    const refreshInterval = setInterval(() => {
      // 强制重新获取协议数据
      refetchProtocolData()
      
      // 强制重新获取图表数据
      refetchChartData()
      
      // 重新获取交易数据
      const fetchTransactions = async () => {
        const data = await fetchTopTransactions(dataClient, activeNetwork.id)
        if (data) {
          updateTransactions(data)
          lastTransactionsRef.current = data
        }
      }
      fetchTransactions()
    }, 30000) // 30 秒

    return () => {
      clearInterval(refreshInterval)
    }
  }, [refetchProtocolData, refetchChartData, updateTransactions, dataClient, activeNetwork.id])

  // 当 refetch 完成后，更新数据（只有当数据真正变化时才更新）
  useEffect(() => {
    if (fetchedProtocolData && !loading && !error) {
      // 只有当数据真正变化时才更新，避免无限循环
      if (!isEqual(lastProtocolDataRef.current, fetchedProtocolData)) {
        updateProtocolData(fetchedProtocolData)
        lastProtocolDataRef.current = fetchedProtocolData
      }
    }
  }, [fetchedProtocolData, loading, error, updateProtocolData])

  // 当图表数据更新后，更新到 store（只有当数据真正变化时才更新）
  useEffect(() => {
    if (fetchedChartData && !chartError) {
      // 只有当数据真正变化时才更新，避免无限循环
      if (!isArrayEqual(lastChartDataRef.current, fetchedChartData)) {
        updateChartData(fetchedChartData)
        lastChartDataRef.current = fetchedChartData
      }
    }
  }, [fetchedChartData, chartError, updateChartData])

  return null
}
