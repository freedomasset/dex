import { useWeb3React } from '@web3-react/core'
import { Navigate, useLocation, useParams } from 'react-router-dom'
import { toWithPreservedRouterSearch } from 'utils/withPreservedRouterSearch'

import { getNativeCurrencySymbol, WRAPPED_NATIVE_CURRENCY } from '../../constants/tokens'
import AddLiquidity from './index'

export default function RedirectDuplicateTokenIds() {
  const { currencyIdA, currencyIdB } = useParams<{ currencyIdA: string; currencyIdB: string; feeAmount?: string }>()
  const location = useLocation()
  const { chainId } = useWeb3React()

  // 同一链上「原生币 + 包装币」视为重复（ETH/WETH、TT/WTT、VANA/WVANA 等）
  const nativeSymbol = chainId !== undefined ? getNativeCurrencySymbol(chainId) : null
  const isETHOrWETHA =
    currencyIdA === 'ETH' ||
    (chainId !== undefined &&
      (currencyIdA === nativeSymbol || currencyIdA === WRAPPED_NATIVE_CURRENCY[chainId]?.address))
  const isETHOrWETHB =
    currencyIdB === 'ETH' ||
    (chainId !== undefined &&
      (currencyIdB === nativeSymbol || currencyIdB === WRAPPED_NATIVE_CURRENCY[chainId]?.address))

  if (
    currencyIdA &&
    currencyIdB &&
    (currencyIdA.toLowerCase() === currencyIdB.toLowerCase() || (isETHOrWETHA && isETHOrWETHB))
  ) {
    return <Navigate to={toWithPreservedRouterSearch(`/add/${currencyIdA}`, location.search)} replace />
  }
  return <AddLiquidity />
}
