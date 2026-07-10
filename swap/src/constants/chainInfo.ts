import { ChainId } from '@vanadex/sdk-core'
import bnbCircleLogoUrl from 'assets/images/bnbCircle.svg'
import ethereumLogoUrl from 'assets/images/ethereum-logo.png'
import ttChainLogoUrl from 'assets/images/simpleFlow/ttChainIcon.png'
import vanaLogoUrl from 'assets/images/vana.png'
import bnbSquareLogoUrl from 'assets/svg/bnb_square_logo.svg'
import bnbLogo from 'assets/svg/bnb-logo.svg'
import polygonSquareLogoUrl from 'assets/svg/polygon_square_logo.svg'
import polygonMaticLogo from 'assets/svg/polygon-matic-logo.svg'
import ms from 'ms'
import { darkTheme } from 'theme/colors'

import {
  getAppChainId,
  TT_CHAIN_MAINNET_ID,
  SupportedL1ChainId,
  SupportedL2ChainId,
  TT_CHAIN_TESTNET_ID,
} from './chains'
import { TT_CHAIN_TESTNET_LIST, TTCHAIN_MAINNET_LIST, UNI_LIST, VANA_MOKSHA_LIST } from './lists'

export const AVERAGE_L1_BLOCK_TIME = ms(`12s`)

export enum NetworkType {
  L1,
  L2,
}
interface BaseChainInfo {
  readonly networkType: NetworkType
  readonly blockWaitMsBeforeWarning?: number
  readonly docs: string
  readonly bridge?: string
  readonly explorer: string
  readonly infoLink: string
  readonly logoUrl: string
  readonly circleLogoUrl?: string
  readonly squareLogoUrl?: string
  readonly label: string
  readonly helpCenterUrl?: string
  readonly nativeCurrency: {
    name: string // e.g. 'Goerli ETH',
    symbol: string // e.g. 'gorETH',
    decimals: number // e.g. 18,
  }
  readonly color?: string
  readonly backgroundColor?: string
}

interface L1ChainInfo extends BaseChainInfo {
  readonly networkType: NetworkType.L1
  readonly defaultListUrl?: string
}

export interface L2ChainInfo extends BaseChainInfo {
  readonly networkType: NetworkType.L2
  readonly bridge: string
  readonly statusPage?: string
  readonly defaultListUrl: string
}

type ChainInfoMap = { readonly [chainId: number]: L1ChainInfo | L2ChainInfo }

const CHAIN_INFO: ChainInfoMap = {
  [TT_CHAIN_MAINNET_ID]: {
    networkType: NetworkType.L1,
    blockWaitMsBeforeWarning: ms(`1s`),
    defaultListUrl: TTCHAIN_MAINNET_LIST,
    docs: 'https://docs.uniswap.org/',
    explorer: 'https://ttchainscan.com/',
    infoLink: 'https://info.uniswap.org/#/',
    label: 'TT Chain Mainnet',
    logoUrl: ttChainLogoUrl,
    circleLogoUrl: ttChainLogoUrl,
    nativeCurrency: { name: 'TT', symbol: 'TT', decimals: 18 },
    color: darkTheme.chain_5,
  },
  [ChainId.MAINNET]: {
    networkType: NetworkType.L1,
    defaultListUrl: UNI_LIST,
    docs: 'https://docs.uniswap.org/',
    explorer: 'https://etherscan.io/',
    infoLink: 'https://info.uniswap.org/#/',
    label: 'Ethereum',
    logoUrl: ethereumLogoUrl,
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
    color: darkTheme.chain_1,
  },
  [ChainId.SEPOLIA]: {
    networkType: NetworkType.L1,
    blockWaitMsBeforeWarning: ms(`12s`),
    defaultListUrl: UNI_LIST,
    docs: 'https://docs.uniswap.org/',
    explorer: 'https://sepolia.etherscan.io/',
    infoLink: 'https://dashboard-testnet.freedomasset.global/#/',
    label: 'Sepolia',
    logoUrl: ethereumLogoUrl,
    nativeCurrency: { name: 'Sepolia Ether', symbol: 'ETH', decimals: 18 },
    color: darkTheme.chain_5,
  },
  [ChainId.POLYGON]: {
    networkType: NetworkType.L1,
    blockWaitMsBeforeWarning: ms(`10m`),
    bridge: 'https://wallet.polygon.technology/polygon/bridge',
    defaultListUrl: UNI_LIST,
    docs: 'https://polygon.technology/',
    explorer: 'https://polygonscan.com/',
    infoLink: 'https://info.uniswap.org/#/polygon/',
    label: 'Polygon',
    logoUrl: polygonMaticLogo,
    circleLogoUrl: polygonMaticLogo,
    squareLogoUrl: polygonSquareLogoUrl,
    nativeCurrency: { name: 'Polygon', symbol: 'POL', decimals: 18 },
    color: darkTheme.chain_137,
    backgroundColor: darkTheme.chain_137_background,
  },
  [ChainId.BNB]: {
    networkType: NetworkType.L1,
    blockWaitMsBeforeWarning: ms(`10m`),
    bridge: 'https://cbridge.celer.network/1/56',
    defaultListUrl: UNI_LIST,
    docs: 'https://docs.bnbchain.org/',
    explorer: 'https://bscscan.com/',
    infoLink: 'https://info.uniswap.org/#/bnb/',
    label: 'BSC Chain',
    logoUrl: bnbLogo,
    circleLogoUrl: bnbCircleLogoUrl,
    squareLogoUrl: bnbSquareLogoUrl,
    nativeCurrency: { name: 'BNB', symbol: 'BNB', decimals: 18 },
    color: darkTheme.chain_56,
    backgroundColor: darkTheme.chain_56_background,
  },
  // [ChainId.GOERLI]: {
  //   networkType: NetworkType.L1,
  //   docs: 'https://docs.uniswap.org/',
  //   explorer: 'https://goerli.etherscan.io/',
  //   infoLink: 'https://info.uniswap.org/#/',
  //   label: 'Görli',
  //   logoUrl: ethereumLogoUrl,
  //   nativeCurrency: { name: 'Görli Ether', symbol: 'görETH', decimals: 18 },
  //   color: darkTheme.chain_5,
  // },
  // [ChainId.OPTIMISM]: {
  //   networkType: NetworkType.L2,
  //   blockWaitMsBeforeWarning: ms(`25m`),
  //   bridge: 'https://app.optimism.io/bridge',
  //   defaultListUrl: OPTIMISM_LIST,
  //   docs: 'https://optimism.io/',
  //   explorer: 'https://optimistic.etherscan.io/',
  //   infoLink: 'https://info.uniswap.org/#/optimism/',
  //   label: 'Optimism',
  //   logoUrl: optimismLogoUrl,
  //   // Optimism perfers same icon for both
  //   circleLogoUrl: optimismLogoUrl,
  //   squareLogoUrl: optimismSquareLogoUrl,
  //   statusPage: 'https://optimism.io/status',
  //   helpCenterUrl: 'https://help.uniswap.org/en/collections/3137778-uniswap-on-optimistic-ethereum-oξ',
  //   nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  //   color: darkTheme.chain_10,
  //   backgroundColor: darkTheme.chain_10_background,
  // },
  // [ChainId.OPTIMISM_GOERLI]: {
  //   networkType: NetworkType.L2,
  //   blockWaitMsBeforeWarning: ms(`25m`),
  //   bridge: 'https://app.optimism.io/bridge',
  //   defaultListUrl: OPTIMISM_LIST,
  //   docs: 'https://optimism.io/',
  //   explorer: 'https://goerli-optimism.etherscan.io/',
  //   infoLink: 'https://info.uniswap.org/#/optimism/',
  //   label: 'Optimism Görli',
  //   logoUrl: optimismLogoUrl,
  //   statusPage: 'https://optimism.io/status',
  //   helpCenterUrl: 'https://help.uniswap.org/en/collections/3137778-uniswap-on-optimistic-ethereum-oξ',
  //   nativeCurrency: { name: 'Optimism Goerli Ether', symbol: 'görOpETH', decimals: 18 },
  //   color: darkTheme.chain_420,
  // },
  // [ChainId.ARBITRUM_ONE]: {
  //   networkType: NetworkType.L2,
  //   blockWaitMsBeforeWarning: ms(`10m`),
  //   bridge: 'https://bridge.arbitrum.io/',
  //   docs: 'https://offchainlabs.com/',
  //   explorer: 'https://arbiscan.io/',
  //   infoLink: 'https://info.uniswap.org/#/arbitrum',
  //   label: 'Arbitrum',
  //   logoUrl: arbitrumLogoUrl,
  //   circleLogoUrl: arbitrumCircleLogoUrl,
  //   defaultListUrl: ARBITRUM_LIST,
  //   helpCenterUrl: 'https://help.uniswap.org/en/collections/3137787-uniswap-on-arbitrum',
  //   nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  //   color: darkTheme.chain_42,
  //   backgroundColor: darkTheme.chain_42161_background,
  // },
  // [ChainId.ARBITRUM_GOERLI]: {
  //   networkType: NetworkType.L2,
  //   blockWaitMsBeforeWarning: ms(`10m`),
  //   bridge: 'https://bridge.arbitrum.io/',
  //   docs: 'https://offchainlabs.com/',
  //   explorer: 'https://goerli.arbiscan.io/',
  //   infoLink: 'https://info.uniswap.org/#/arbitrum/',
  //   label: 'Arbitrum Goerli',
  //   logoUrl: arbitrumLogoUrl,
  //   defaultListUrl: ARBITRUM_LIST, // TODO: use arbitrum goerli token list
  //   helpCenterUrl: 'https://help.uniswap.org/en/collections/3137787-uniswap-on-arbitrum',
  //   nativeCurrency: { name: 'Goerli Arbitrum Ether', symbol: 'goerliArbETH', decimals: 18 },
  //   color: darkTheme.chain_421613,
  // },
  // [ChainId.POLYGON]: {
  //   networkType: NetworkType.L1,
  //   blockWaitMsBeforeWarning: ms(`10m`),
  //   bridge: 'https://wallet.polygon.technology/polygon/bridge',
  //   docs: 'https://polygon.io/',
  //   explorer: 'https://polygonscan.com/',
  //   infoLink: 'https://info.uniswap.org/#/polygon/',
  //   label: 'Polygon',
  //   logoUrl: polygonMaticLogo,
  //   circleLogoUrl: polygonCircleLogoUrl,
  //   squareLogoUrl: polygonSquareLogoUrl,
  //   nativeCurrency: { name: 'Polygon Matic', symbol: 'MATIC', decimals: 18 },
  //   color: darkTheme.chain_137,
  //   backgroundColor: darkTheme.chain_137_background,
  // },
  // [ChainId.POLYGON_MUMBAI]: {
  //   networkType: NetworkType.L1,
  //   blockWaitMsBeforeWarning: ms(`10m`),
  //   bridge: 'https://wallet.polygon.technology/polygon/bridge/deposit',
  //   docs: 'https://polygon.io/',
  //   explorer: 'https://mumbai.polygonscan.com/',
  //   infoLink: 'https://info.uniswap.org/#/polygon/',
  //   label: 'Polygon Mumbai',
  //   logoUrl: polygonMaticLogo,
  //   nativeCurrency: { name: 'Polygon Mumbai Matic', symbol: 'mMATIC', decimals: 18 },
  // },
  // [ChainId.CELO]: {
  //   networkType: NetworkType.L1,
  //   blockWaitMsBeforeWarning: ms(`10m`),
  //   bridge: 'https://www.portalbridge.com/#/transfer',
  //   docs: 'https://docs.celo.org/',
  //   explorer: 'https://celoscan.io/',
  //   infoLink: 'https://info.uniswap.org/#/celo/',
  //   label: 'Celo',
  //   logoUrl: celoLogo,
  //   circleLogoUrl: celoLogo,
  //   squareLogoUrl: celoSquareLogoUrl,
  //   nativeCurrency: { name: 'Celo', symbol: 'CELO', decimals: 18 },
  //   defaultListUrl: CELO_LIST,
  // },
  // [ChainId.CELO_ALFAJORES]: {
  //   networkType: NetworkType.L1,
  //   blockWaitMsBeforeWarning: ms(`10m`),
  //   bridge: 'https://www.portalbridge.com/#/transfer',
  //   docs: 'https://docs.celo.org/',
  //   explorer: 'https://alfajores-blockscout.celo-testnet.org/',
  //   infoLink: 'https://info.uniswap.org/#/celo/',
  //   label: 'Celo Alfajores',
  //   logoUrl: celoLogo,
  //   nativeCurrency: { name: 'Celo', symbol: 'CELO', decimals: 18 },
  //   defaultListUrl: CELO_LIST,
  // },
  // [ChainId.BNB]: {
  //   networkType: NetworkType.L1,
  //   blockWaitMsBeforeWarning: ms(`10m`),
  //   bridge: 'https://cbridge.celer.network/1/56',
  //   docs: 'https://docs.bnbchain.org/',
  //   explorer: 'https://bscscan.com/',
  //   infoLink: 'https://info.uniswap.org/#/bnb/',
  //   label: 'BSC Chain',
  //   logoUrl: bnbLogo,
  //   circleLogoUrl: bnbCircleLogoUrl,
  //   squareLogoUrl: bnbSquareLogoUrl,
  //   nativeCurrency: { name: 'BNB', symbol: 'BNB', decimals: 18 },
  //   defaultListUrl: PLASMA_BNB_LIST,
  //   color: darkTheme.chain_56,
  //   backgroundColor: darkTheme.chain_56_background,
  // },
  // [ChainId.AVALANCHE]: {
  //   networkType: NetworkType.L1,
  //   blockWaitMsBeforeWarning: ms(`10m`),
  //   bridge: 'https://core.app/bridge/',
  //   docs: 'https://docs.avax.network/',
  //   explorer: 'https://snowtrace.io/',
  //   infoLink: 'https://info.uniswap.org/#/avax/', // TODO(WEB-2336): Add avax support to info site
  //   label: 'Avalanche',
  //   logoUrl: avaxLogo,
  //   circleLogoUrl: avaxLogo,
  //   squareLogoUrl: avaxSquareLogo,
  //   nativeCurrency: { name: 'AVAX', symbol: 'AVAX', decimals: 18 },
  //   defaultListUrl: AVALANCHE_LIST,
  //   color: darkTheme.chain_43114,
  //   backgroundColor: darkTheme.chain_43114_background,
  // },
  // [ChainId.BASE]: {
  //   networkType: NetworkType.L2,
  //   blockWaitMsBeforeWarning: ms(`25m`),
  //   bridge: 'https://bridge.base.org/deposit',
  //   defaultListUrl: BASE_LIST,
  //   docs: 'https://docs.base.org',
  //   explorer: 'https://basescan.org/',
  //   infoLink: 'https://info.uniswap.org/#/base/',
  //   label: 'Base',
  //   logoUrl: baseLogo,
  //   statusPage: 'https://status.base.org/',
  //   circleLogoUrl: baseLogo,
  //   squareLogoUrl: baseSquareLogo,
  //   nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  //   color: darkTheme.chain_84531,
  // },
  [ChainId.VANA]: {
    networkType: NetworkType.L1,
    blockWaitMsBeforeWarning: ms(`10m`),
    bridge: 'https://stargate.finance/bridge?srcChain=vana',
    defaultListUrl: VANA_MOKSHA_LIST,
    docs: 'https://docs.datadex.com/',
    explorer: 'https://islander.vanascan.io/',
    infoLink: 'https://info.datadex.com/',
    label: 'Vana',
    logoUrl: vanaLogoUrl,
    circleLogoUrl: vanaLogoUrl,
    nativeCurrency: { name: 'Vana', symbol: 'VANA', decimals: 18 },
    color: darkTheme.chain_5,
  },
  [ChainId.VANA_MOKSHA]: {
    networkType: NetworkType.L1,
    blockWaitMsBeforeWarning: ms(`10m`),
    defaultListUrl: VANA_MOKSHA_LIST,
    docs: 'https://docs.uniswap.org/',
    explorer: 'https://moksha.vanascan.io/',
    infoLink: 'https://info.uniswap.org/#/',
    label: 'Vana Moksha',
    logoUrl: vanaLogoUrl,
    circleLogoUrl: vanaLogoUrl,
    nativeCurrency: { name: 'Vana', symbol: 'VANA', decimals: 18 },
    color: darkTheme.chain_5,
  },
  [TT_CHAIN_TESTNET_ID]: {
    networkType: NetworkType.L1,
    blockWaitMsBeforeWarning: ms(`12s`),
    defaultListUrl: TT_CHAIN_TESTNET_LIST,
    docs: 'https://docs.uniswap.org/',
    explorer: 'https://testnet.ttchainscan.com/',
    infoLink: 'https://dashboard-testnet.freedomasset.global/#/',
    label: 'TT Chain Testnet',
    logoUrl: ethereumLogoUrl,
    nativeCurrency: { name: 'TT', symbol: 'TT', decimals: 18 },
    color: darkTheme.chain_5,
  },
} as const

export function getChainInfo(chainId: SupportedL1ChainId): L1ChainInfo
export function getChainInfo(chainId: SupportedL2ChainId): L2ChainInfo
export function getChainInfo(chainId: ChainId): L1ChainInfo | L2ChainInfo
export function getChainInfo(
  chainId: ChainId | SupportedL1ChainId | SupportedL2ChainId | number | undefined
): L1ChainInfo | L2ChainInfo | undefined

/**
 * Overloaded method for returning ChainInfo given a chainID
 * Return type varies depending on input type:
 * number | undefined -> returns chaininfo | undefined
 * ChainId -> returns L1ChainInfo | L2ChainInfo
 * SupportedL1ChainId -> returns L1ChainInfo
 * SupportedL2ChainId -> returns L2ChainInfo
 */
export function getChainInfo(chainId: any): any {
  if (chainId) {
    return CHAIN_INFO[chainId] ?? undefined
  }
  return undefined
}

/** 无 chainId 时的兜底：使用当前应用默认链（dev=TT 测试网，prod=TT 主网） */
export function getChainInfoOrDefault(chainId: number | undefined) {
  return getChainInfo(chainId) ?? getChainInfo(getAppChainId()) ?? CHAIN_INFO[TT_CHAIN_MAINNET_ID]
}
