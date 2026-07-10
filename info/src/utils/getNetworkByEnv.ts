import { ChainId } from '@vanadex/sdk-core'
import { TT_CHAIN_MAINNET_CHAIN_ID, TT_CHAIN_TESTNET_CHAIN_ID } from 'constants/chains'
import {
  INFO_INTERFACE_NETWORKS,
  NetworkInfo,
  TtChainNetworkInfo,
  TtChainMainnetNetworkInfo,
} from 'constants/networks'

const CHAIN_ID_TO_SWAP_CHAIN_PARAM: Record<number, string> = {
  [ChainId.MAINNET]: 'ethereum',
  [ChainId.SEPOLIA]: 'sepolia',
  [ChainId.POLYGON]: 'polygon',
  [ChainId.BNB]: 'bsc',
  [TT_CHAIN_MAINNET_CHAIN_ID]: 'tt_chain',
  [TT_CHAIN_TESTNET_CHAIN_ID]: 'tt_chain_testnet',
}

/**
 * 与 dex-frontend `URL_CHAIN_PARAM_TO_CHAIN_ID` 一致，便于 Swap → Info 跳转带 `chain=`。
 */
export const URL_CHAIN_PARAM_TO_CHAIN_ID: Record<string, number> = {
  ethereum: ChainId.MAINNET,
  eth: ChainId.MAINNET,
  mainnet: ChainId.MAINNET,
  sepolia: ChainId.SEPOLIA,
  eth_sepolia: ChainId.SEPOLIA,
  polygon: ChainId.POLYGON,
  bsc: ChainId.BNB,
  bnb: ChainId.BNB,
  tt_chain: TT_CHAIN_MAINNET_CHAIN_ID,
  tt_chain_testnet: TT_CHAIN_TESTNET_CHAIN_ID,
}

/** 将 `?chain=` 解析为当前 Info 支持的 NetworkInfo（不在 interface 列表则返回 null） */
export function resolveInfoNetworkFromChainQuery(chainParam: string | null | undefined): NetworkInfo | null {
  if (!chainParam) return null
  const chainId = URL_CHAIN_PARAM_TO_CHAIN_ID[chainParam]
  if (chainId === undefined) return null
  return INFO_INTERFACE_NETWORKS.find((n) => n.chainId === chainId) ?? null
}

/** Info 当前链在 Swap 前端 `chain` 查询参数中的取值（与 dex-frontend CHAIN_ID_TO_URL_CHAIN_PARAM 对齐） */
export function getSwapChainParamFromChainId(chainId: number): string {
  return CHAIN_ID_TO_SWAP_CHAIN_PARAM[chainId] ?? 'tt_chain'
}

/** 从地址栏读取 `chain=`（Hash 内 `/#/path?chain=` 或 `/?chain=#/path` 均支持） */
export function readChainParamFromWindow(): string | null {
  if (typeof window === 'undefined') return null

  const hash = window.location.hash
  const hashQueryIdx = hash.indexOf('?')
  if (hashQueryIdx >= 0) {
    const fromHash = new URLSearchParams(hash.slice(hashQueryIdx + 1)).get('chain')
    if (fromHash) return fromHash
  }

  return new URLSearchParams(window.location.search).get('chain')
}

/** Redux 初始网络：URL `chain=` 优先，否则按 REACT_APP_ENV */
export function getInitialActiveNetwork(): NetworkInfo {
  const chainParam = readChainParamFromWindow()
  if (chainParam) {
    const fromUrl = resolveInfoNetworkFromChainQuery(chainParam)
    if (fromUrl) return fromUrl
  }
  return getNetworkByEnv()
}

import { isProdEnv } from './env'

export { isProdEnv } from './env'

/**
 * 根据环境变量获取当前网络
 * - dev/test 环境：使用测试网络
 * - prod 环境：使用主网
 */
export function getNetworkByEnv(): NetworkInfo {
  if (isProdEnv()) {
    return TtChainMainnetNetworkInfo
  }

  // dev/test 环境使用测试网（默认）
  return TtChainNetworkInfo
}

/**
 * 根据环境变量获取 DEX 前端地址
 * - 生产环境：dex.freedomasset.global
 * - 其他环境：dex-testnet.freedomasset.global
 */
export function getDexBaseUrl(): string {
  if (isProdEnv()) {
    return 'https://dex.freedomasset.global'
  }
  return 'https://dex-testnet.freedomasset.global'
}
