import { ChainId, SUPPORTED_CHAINS } from '@vanadex/sdk-core'

/** TT Chain 主网 chainId（对齐 SDK：ChainId.TT_CHAIN = 1679） */
// eslint-disable-next-line import/no-unused-modules -- 被 getExplorerLink/tokens/routing/providers/networks/connection/chainInfo/activate 等引用
export const TT_CHAIN_MAINNET_ID = ChainId.TT_CHAIN

/** TT Chain 测试网 chainId（production 构建的 SDK 可能未导出 ChainId.TT_CHAIN_TESTNET，用本地常量保证稳定） */
// eslint-disable-next-line import/no-unused-modules -- 被 providers/networks/chainInfo/getExplorerLink/activate/useSwitchChain 等引用
export const TT_CHAIN_TESTNET_ID = 167901

/**
 * 根据环境确定当前应用使用的链：prod 使用 TT 主网(1679)，dev/test 使用 TT 测试网(167901)。
 * 通过 REACT_APP_CHAIN=prod 打包时为主网，否则为测试网。
 */
export function getAppChainId(): number {
  return process.env.REACT_APP_CHAIN === 'prod' ? TT_CHAIN_MAINNET_ID : TT_CHAIN_TESTNET_ID
}

export const CHAIN_IDS_TO_NAMES = {
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
  [ChainId.VANA]: 'vana',
  [ChainId.VANA_MOKSHA]: 'vana_moksha',
  [TT_CHAIN_MAINNET_ID]: 'tt_chain',
  [TT_CHAIN_TESTNET_ID]: 'tt_chain_testnet',
} as const

/** URL 参数 chain 与 chainId 映射；TT 主网 canonical 为 tt_chain */
// eslint-disable-next-line import/no-unused-modules -- 被 useSyncChainQuery/Option/NavBar/useSelectChain 等引用
export const URL_CHAIN_PARAM_TO_CHAIN_ID: { [param: string]: number } = {
  ethereum: ChainId.MAINNET,
  eth: ChainId.MAINNET,
  mainnet: ChainId.MAINNET,
  sepolia: ChainId.SEPOLIA,
  eth_sepolia: ChainId.SEPOLIA,
  polygon: ChainId.POLYGON,
  bsc: ChainId.BNB,
  bnb: ChainId.BNB,
  tt_chain: TT_CHAIN_MAINNET_ID,
  tt_chain_testnet: TT_CHAIN_TESTNET_ID,
}

// eslint-disable-next-line import/no-unused-modules -- 被 getChainParamFromChainId 及 NavBar/useSelectChain/useSyncChainQuery 引用
export const CHAIN_ID_TO_URL_CHAIN_PARAM: { [chainId: number]: string } = {
  [ChainId.MAINNET]: 'ethereum',
  [ChainId.SEPOLIA]: 'sepolia',
  [ChainId.POLYGON]: 'polygon',
  [ChainId.BNB]: 'bsc',
  [TT_CHAIN_MAINNET_ID]: 'tt_chain',
  [TT_CHAIN_TESTNET_ID]: 'tt_chain_testnet',
}

/** 从 URL 参数 chain 解析 chainId，缺省或非法时使用 getAppChainId（dev=TT 测试网，prod=TT 主网） */
// eslint-disable-next-line import/no-unused-modules -- 被 Option/useSyncChainQuery 引用
export function getChainIdFromUrlParam(param: string | null): number {
  if (!param) return getAppChainId()
  const id = URL_CHAIN_PARAM_TO_CHAIN_ID[param]
  return id ?? getAppChainId()
}

/** 根据 chainId 返回 URL 参数 chain */
// eslint-disable-next-line import/no-unused-modules -- 被 NavBar/useSelectChain/useSyncChainQuery 引用
export function getChainParamFromChainId(chainId: number | undefined): string | undefined {
  if (chainId === undefined) return undefined
  return CHAIN_ID_TO_URL_CHAIN_PARAM[chainId]
}

// Include ChainIds in this array if they are not supported by the UX yet, but are already in the SDK.
const NOT_YET_UX_SUPPORTED_CHAIN_IDS: number[] = [ChainId.BASE_GOERLI]

// TODO: include BASE_GOERLI when routing is implemented
export type SupportedInterfaceChain =
  | typeof TT_CHAIN_MAINNET_ID
  | ChainId.VANA_MOKSHA
  | ChainId.MAINNET
  | ChainId.SEPOLIA
  | ChainId.POLYGON
  | ChainId.BNB
  | ChainId.VANA
  | typeof TT_CHAIN_TESTNET_ID
// | ChainId.OPTIMISM
// | ChainId.OPTIMISM_GOERLI
// | ChainId.ARBITRUM_ONE
// | ChainId.ARBITRUM_GOERLI
// | ChainId.POLYGON_MUMBAI
// | ChainId.GOERLI
// | ChainId.CELO_ALFAJORES
// | ChainId.CELO
// | ChainId.AVALANCHE
// | ChainId.BASE

export function isSupportedChain(chainId: number | null | undefined | ChainId): chainId is SupportedInterfaceChain {
  if (!chainId || NOT_YET_UX_SUPPORTED_CHAIN_IDS.indexOf(chainId) !== -1) return false
  // Vanadex 多链主网（与 SDK 列表无关，前端显式开放）
  if (chainId === ChainId.MAINNET || chainId === ChainId.POLYGON || chainId === ChainId.BNB) return true
  if (chainId === ChainId.SEPOLIA) return true
  // TT Chain 主网 (1679) 尚未加入 SDK SUPPORTED_CHAINS 时，前端单独支持
  if (chainId === TT_CHAIN_MAINNET_ID) return true
  if (chainId === TT_CHAIN_TESTNET_ID) return true
  return SUPPORTED_CHAINS.indexOf(chainId) !== -1
}

export function asSupportedChain(chainId: number | null | undefined | ChainId): SupportedInterfaceChain | undefined {
  if (!chainId) return undefined
  return isSupportedChain(chainId) ? chainId : undefined
}

export const SUPPORTED_GAS_ESTIMATE_CHAIN_IDS = [
  ChainId.MAINNET,
  ChainId.POLYGON,
  ChainId.SEPOLIA,
  ChainId.CELO,
  ChainId.OPTIMISM,
  ChainId.ARBITRUM_ONE,
  ChainId.BNB,
  ChainId.AVALANCHE,
  ChainId.BASE,
] as const

/** 界面链选择器中展示且可切换的链（需具备 chainInfo、RPC、路由/列表配置） */
export const INTERFACE_SUPPORTED_CHAIN_IDS: SupportedInterfaceChain[] = [
  ChainId.MAINNET,
  ChainId.SEPOLIA,
  ChainId.POLYGON,
  ChainId.BNB,
  TT_CHAIN_MAINNET_ID,
  TT_CHAIN_TESTNET_ID,
]

// eslint-disable-next-line import/no-unused-modules -- 保留：表示应用支持的链列表
export const SUPPORTED_CHAIN_IDS = [
  ChainId.MAINNET,
  ChainId.SEPOLIA,
  ChainId.POLYGON,
  ChainId.BNB,
  TT_CHAIN_MAINNET_ID,
  TT_CHAIN_TESTNET_ID,
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
  TT_CHAIN_TESTNET_ID,
  // ChainId.VANA_MOKSHA,
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
  TT_CHAIN_MAINNET_ID,
  TT_CHAIN_TESTNET_ID,
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
export function getChainPriority(chainId: ChainId | number): number {
  switch (chainId) {
    case ChainId.MAINNET:
      return 0
    case ChainId.SEPOLIA:
      return 0
    case ChainId.POLYGON:
      return 3
    case ChainId.BNB:
      return 5
    case TT_CHAIN_MAINNET_ID:
      return TT_CHAIN_MAINNET_ID
    case TT_CHAIN_TESTNET_ID:
      return TT_CHAIN_TESTNET_ID
    case ChainId.VANA:
      return 1480
    case ChainId.VANA_MOKSHA:
      return 14800
    default:
      return 14800
  }
}
