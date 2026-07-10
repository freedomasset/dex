import { useWeb3React } from '@web3-react/core'
import { networkConnection } from 'connection'
import { asSupportedChain, getChainIdFromUrlParam, isSupportedChain } from 'constants/chains'
import { useEffect, useMemo, useRef } from 'react'

import useParsedQueryString from './useParsedQueryString'
import useSelectChain from './useSelectChain'

/**
 * 以 Hash 路由上查询参数 `chain` 为目标链（缺省则用 getAppChainId）：
 * - 未连接钱包：只读 network 连接器激活到目标链
 * - 已连接：仅在目标链变化或刚连上需对齐时请求一次 wallet 切链，避免拒绝切链后死循环重试
 */
export default function useSyncChainQuery() {
  const { chainId, isActive, account } = useWeb3React()
  const selectChain = useSelectChain()
  const qs = useParsedQueryString()
  const chainParam = typeof qs.chain === 'string' ? qs.chain : null

  const targetChainId = useMemo(() => {
    const id = getChainIdFromUrlParam(chainParam)
    return asSupportedChain(id)
  }, [chainParam])

  const walletTargetRef = useRef<number | undefined>(undefined)

  useEffect(() => {
    if (!account) {
      walletTargetRef.current = undefined
    }
  }, [account])

  useEffect(() => {
    if (account) return
    if (targetChainId !== undefined && isSupportedChain(targetChainId)) {
      networkConnection.connector.activate(targetChainId)
    }
  }, [account, targetChainId])

  useEffect(() => {
    if (!isActive || !account || targetChainId === undefined) return
    if (chainId === targetChainId) {
      walletTargetRef.current = targetChainId
      return
    }
    if (!isSupportedChain(targetChainId)) return

    const targetChanged = walletTargetRef.current !== targetChainId
    if (targetChanged) {
      walletTargetRef.current = targetChainId
      void selectChain(targetChainId)
    }
  }, [isActive, account, chainId, targetChainId, selectChain])
}
