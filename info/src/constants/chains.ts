import { ChainId, SUPPORTED_CHAINS, SupportedChainsType } from '@vanadex/sdk-core'

/** TT Chain 主网 chainId（官方：https://tt-chain.io/quickstart） */
export const TT_CHAIN_MAINNET_CHAIN_ID = 1679
/** TT Chain 测试网 chainId（与 @vanadex/sdk-core 保持一致） */
export const TT_CHAIN_TESTNET_CHAIN_ID = ChainId.TT_CHAIN_TESTNET

export function isInfoTestnetChainId(chainId: number): boolean {
  return chainId === ChainId.SEPOLIA || chainId === TT_CHAIN_TESTNET_CHAIN_ID
}

export const CHAIN_IDS_TO_NAMES: { [key: number]: string } = {
  [ChainId.MAINNET]: 'mainnet',
  [ChainId.GOERLI]: 'goerli',
  [ChainId.SEPOLIA]: 'sepolia',
  [ChainId.POLYGON]: 'polygon',
  [ChainId.POLYGON_MUMBAI]: 'polygon_mumbai',
  [ChainId.CELO]: 'celo',
  [ChainId.CELO_ALFAJORES]: 'celo_alfajores',
  [ChainId.ARBITRUM_ONE]: 'arbitrum',
  [ChainId.ARBITRUM_GOERLI]: 'arbitrum_goerli',
  [ChainId.OPTIMISM]: 'optimism',
  [ChainId.OPTIMISM_GOERLI]: 'optimism_goerli',
  [ChainId.BNB]: 'bnb',
  [ChainId.AVALANCHE]: 'avalanche',
  [ChainId.BASE]: 'base',
  [TT_CHAIN_TESTNET_CHAIN_ID]: 'tt_chain_testnet',
  [TT_CHAIN_MAINNET_CHAIN_ID]: 'tt_chain',
}

// Include ChainIds in this array if they are not supported by the UX yet, but are already in the SDK.
const NOT_YET_UX_SUPPORTED_CHAIN_IDS: number[] = [ChainId.BASE_GOERLI]

// TODO: include BASE_GOERLI when routing is implemented
// 包含 TT Chain 的 chainId，与 SDK 的 SupportedChainsType 并列
export type SupportedInterfaceChain =
  | Exclude<SupportedChainsType, ChainId.BASE_GOERLI>
  | typeof TT_CHAIN_MAINNET_CHAIN_ID
  | typeof TT_CHAIN_TESTNET_CHAIN_ID

export function isSupportedChain(
  chainId: number | null | undefined | ChainId,
  featureFlags?: Record<number, boolean>,
): chainId is SupportedInterfaceChain {
  if (featureFlags && chainId && chainId in featureFlags) {
    return featureFlags[chainId]
  }
  const isTtChain = chainId === TT_CHAIN_MAINNET_CHAIN_ID || chainId === TT_CHAIN_TESTNET_CHAIN_ID
  return (
    !!chainId &&
    (SUPPORTED_CHAINS.indexOf(chainId) !== -1 || isTtChain) &&
    NOT_YET_UX_SUPPORTED_CHAIN_IDS.indexOf(chainId) === -1
  )
}

export function asSupportedChain(
  chainId: number | null | undefined | ChainId,
  featureFlags?: Record<number, boolean>,
): SupportedInterfaceChain | undefined {
  if (!chainId) return undefined
  if (featureFlags && chainId in featureFlags && !featureFlags[chainId]) {
    return undefined
  }
  return isSupportedChain(chainId) ? chainId : undefined
}

export const SUPPORTED_GAS_ESTIMATE_CHAIN_IDS = [
  ChainId.MAINNET,
  ChainId.POLYGON,
  ChainId.CELO,
  ChainId.OPTIMISM,
  ChainId.ARBITRUM_ONE,
  ChainId.BNB,
  ChainId.AVALANCHE,
  ChainId.BASE,
] as const

/**
 * Supported networks for V2 pool behavior.
 */
export const SUPPORTED_V2POOL_CHAIN_IDS = [ChainId.MAINNET, ChainId.GOERLI] as const

export const TESTNET_CHAIN_IDS = [
  ChainId.GOERLI,
  ChainId.SEPOLIA,
  ChainId.POLYGON_MUMBAI,
  ChainId.ARBITRUM_GOERLI,
  ChainId.OPTIMISM_GOERLI,
  ChainId.CELO_ALFAJORES,
  ChainId.VANA_MOKSHA,
  TT_CHAIN_TESTNET_CHAIN_ID,
] as const

/**
 * All the chain IDs that are running the Ethereum protocol.
 */
export const L1_CHAIN_IDS = [
  ChainId.MAINNET,
  ChainId.GOERLI,
  ChainId.SEPOLIA,
  ChainId.POLYGON,
  ChainId.POLYGON_MUMBAI,
  ChainId.CELO,
  ChainId.CELO_ALFAJORES,
  ChainId.BNB,
  ChainId.AVALANCHE,
  ChainId.VANA,
  ChainId.VANA_MOKSHA,
  TT_CHAIN_TESTNET_CHAIN_ID,
  TT_CHAIN_MAINNET_CHAIN_ID,
] as const

export type SupportedL1ChainId = (typeof L1_CHAIN_IDS)[number]

/**
 * Controls some L2 specific behavior, e.g. slippage tolerance, special UI behavior.
 * The expectation is that all of these networks have immediate transaction confirmation.
 */
export const L2_CHAIN_IDS = [
  ChainId.ARBITRUM_ONE,
  ChainId.ARBITRUM_GOERLI,
  ChainId.OPTIMISM,
  ChainId.OPTIMISM_GOERLI,
  ChainId.BASE,
] as const

export type SupportedL2ChainId = (typeof L2_CHAIN_IDS)[number]

/**
 * Get the priority of a chainId based on its relevance to the user.
 * @param {ChainId} chainId - The chainId to determine the priority for.
 * @returns {number} The priority of the chainId, the lower the priority, the earlier it should be displayed, with base of MAINNET=0.
 */
export function getChainPriority(chainId: number | ChainId): number {
  switch (chainId) {
    case ChainId.MAINNET:
      return 0
    case ChainId.SEPOLIA:
      return 0
    case ChainId.POLYGON:
      return 3
    case ChainId.BNB:
      return 5
    case TT_CHAIN_MAINNET_CHAIN_ID:
      return 6
    case TT_CHAIN_TESTNET_CHAIN_ID:
      return 8
    case ChainId.GOERLI:
      return 10
    case ChainId.ARBITRUM_ONE:
    case ChainId.ARBITRUM_GOERLI:
      return 11
    case ChainId.OPTIMISM:
    case ChainId.OPTIMISM_GOERLI:
      return 12
    case ChainId.POLYGON_MUMBAI:
      return 13
    case ChainId.BASE:
      return 14
    case ChainId.AVALANCHE:
      return 15
    case ChainId.CELO:
    case ChainId.CELO_ALFAJORES:
      return 16
    default:
      return 20
  }
}

export function isUniswapXSupportedChain(chainId: number) {
  return chainId === ChainId.MAINNET
}
