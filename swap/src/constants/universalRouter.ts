import { UNIVERSAL_ROUTER_ADDRESS } from '@vanadex/universal-router-sdk'

import { UNIVERSAL_ROUTER_ADDRESSES } from './contracts'

/**
 * 返回当前链的 Universal Router 合约地址。
 * TT Chain 测试网 (167901) 未部署 Universal Router，返回 undefined，避免 SDK 抛错。
 */
export function getUniversalRouterAddress(chainId: number | undefined): string | undefined {
  if (chainId === undefined) return undefined
  if (UNIVERSAL_ROUTER_ADDRESSES[chainId]) return UNIVERSAL_ROUTER_ADDRESSES[chainId]
  try {
    return UNIVERSAL_ROUTER_ADDRESS(chainId)
  } catch {
    return undefined
  }
}
