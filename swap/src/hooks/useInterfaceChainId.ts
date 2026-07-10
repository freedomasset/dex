import { asSupportedChain, getAppChainId, getChainIdFromUrlParam } from 'constants/chains'
import { useMemo } from 'react'

import useParsedQueryString from './useParsedQueryString'

/** URL `chain`（Hash 内查询参数）与默认环境链解析出的「界面期望链」，用于报价/列表等与钱包无关的上下文 */
export default function useInterfaceChainId() {
  const qs = useParsedQueryString()
  const chainParam = typeof qs.chain === 'string' ? qs.chain : null

  return useMemo(() => {
    const fromUrl = getChainIdFromUrlParam(chainParam)
    const supported = asSupportedChain(fromUrl)
    return supported ?? asSupportedChain(getAppChainId())
  }, [chainParam])
}
