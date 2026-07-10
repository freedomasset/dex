import OPTIMISM_LOGO_URL from '../assets/images/optimism.svg'
import ARBITRUM_LOGO_URL from '../assets/images/arbitrum.svg'
import ETHEREUM_LOGO_URL from '../assets/images/ethereum-logo.png'
import POLYGON_LOGO_URL from '../assets/images/polygon-logo.png'
import CELO_LOGO_URL from '../assets/images/celo-logo.svg'
import BNB_LOGO_URL from '../assets/images/bnb-logo.svg'
import BASE_LOGO_URL from '../assets/images/base-logo.svg'
import { ChainId } from '@vanadex/sdk-core'
import { TT_CHAIN_MAINNET_CHAIN_ID, TT_CHAIN_TESTNET_CHAIN_ID } from './chains'
import AVALANCHE_LOGO_URL from '../assets/images/avalanche-logo.png'
import VANA_LOGO_URL from '../assets/images/icon.svg'
import TT_CHAIN_LOGO_URL from '../assets/images/simpleFlow/ttChainIcon.png'

export enum SupportedNetwork {
  ETHEREUM,
  ARBITRUM,
  OPTIMISM,
  POLYGON,
  CELO,
  BNB,
  BASE,
  AVALANCHE,
  VANA,
  VANA_MOKSHA,
  TT_CHAIN,
  TT_CHAIN_MAINNET,
  SEPOLIA,
}

export type NetworkInfo = {
  chainId: number
  id: SupportedNetwork
  route: string
  name: string
  imageURL: string
  bgColor: string
  primaryColor: string
  secondaryColor: string
}

export const EthereumNetworkInfo: NetworkInfo = {
  chainId: ChainId.MAINNET,
  id: SupportedNetwork.ETHEREUM,
  route: '',
  name: 'Ethereum',
  bgColor: '#fc077d',
  primaryColor: '#fc077d',
  secondaryColor: '#2172E5',
  imageURL: ETHEREUM_LOGO_URL,
}

export const ArbitrumNetworkInfo: NetworkInfo = {
  chainId: ChainId.ARBITRUM_ONE,
  id: SupportedNetwork.ARBITRUM,
  route: 'arbitrum',
  name: 'Arbitrum',
  imageURL: ARBITRUM_LOGO_URL,
  bgColor: '#0A294B',
  primaryColor: '#0490ED',
  secondaryColor: '#96BEDC',
}

export const OptimismNetworkInfo: NetworkInfo = {
  chainId: ChainId.OPTIMISM,
  id: SupportedNetwork.OPTIMISM,
  route: 'optimism',
  name: 'Optimism',
  bgColor: '#F01B36',
  primaryColor: '#F01B36',
  secondaryColor: '#FB7876',
  imageURL: OPTIMISM_LOGO_URL,
}

export const PolygonNetworkInfo: NetworkInfo = {
  chainId: ChainId.POLYGON,
  id: SupportedNetwork.POLYGON,
  route: 'polygon',
  name: 'Polygon',
  bgColor: '#8247e5',
  primaryColor: '#8247e5',
  secondaryColor: '#FB7876',
  imageURL: POLYGON_LOGO_URL,
}
export const CeloNetworkInfo: NetworkInfo = {
  chainId: ChainId.CELO,
  id: SupportedNetwork.CELO,
  route: 'celo',
  name: 'Celo',
  bgColor: '#02502F',
  primaryColor: '#35D07F',
  secondaryColor: '#9ACDB2',
  imageURL: CELO_LOGO_URL,
}

/** BSC 主网（子图见 constants/subgraphs BSC_SUBGRAPH_HTTP） */
export const BNBNetworkInfo: NetworkInfo = {
  chainId: ChainId.BNB,
  id: SupportedNetwork.BNB,
  route: 'bnb',
  name: 'BSC Chain',
  bgColor: '#F0B90B',
  primaryColor: '#F0B90B',
  secondaryColor: '#F0B90B',
  imageURL: BNB_LOGO_URL,
}

export const BaseNetworkInfo: NetworkInfo = {
  chainId: ChainId.BASE,
  id: SupportedNetwork.BASE,
  route: 'base',
  name: 'Base',
  bgColor: '#0052ff',
  primaryColor: '#0052ff',
  secondaryColor: '#0052ff',
  imageURL: BASE_LOGO_URL,
}

export const AvalancheNetworkInfo: NetworkInfo = {
  chainId: 43114,
  id: SupportedNetwork.AVALANCHE,
  route: 'avax',
  name: 'Avalanche',
  bgColor: '#e84142',
  primaryColor: '#e84142',
  secondaryColor: '#e84142',
  imageURL: AVALANCHE_LOGO_URL,
}

export const VanaNetworkInfo: NetworkInfo = {
  chainId: 1480,
  id: SupportedNetwork.VANA,
  route: 'vana',
  name: 'Vana',
  bgColor: '#4040ff',
  primaryColor: '#4040ff',
  secondaryColor: '#4040ff',
  imageURL: VANA_LOGO_URL,
}

export const VanaMokshaNetworkInfo: NetworkInfo = {
  chainId: 14800,
  id: SupportedNetwork.VANA_MOKSHA,
  route: 'vana-moksha',
  name: 'Vana Moksha',
  bgColor: '#4040ff',
  primaryColor: '#4040ff',
  secondaryColor: '#4040ff',
  imageURL: VANA_LOGO_URL,
}

export const TtChainNetworkInfo: NetworkInfo = {
  chainId: TT_CHAIN_TESTNET_CHAIN_ID,
  id: SupportedNetwork.TT_CHAIN,
  route: 'tt-chain-testnet',
  name: 'TT Chain Testnet',
  bgColor: '#000000',
  primaryColor: '#000000',
  secondaryColor: '#000000',
  imageURL: TT_CHAIN_LOGO_URL,
}

export const TtChainMainnetNetworkInfo: NetworkInfo = {
  chainId: TT_CHAIN_MAINNET_CHAIN_ID,
  id: SupportedNetwork.TT_CHAIN_MAINNET,
  route: 'tt-chain',
  name: 'TT Chain Mainnet',
  bgColor: '#000000',
  primaryColor: '#000000',
  secondaryColor: '#000000',
  imageURL: TT_CHAIN_LOGO_URL,
}

/** Sepolia（与 Swap 一致，子图见 apollo/client sepoliaClient） */
export const SepoliaNetworkInfo: NetworkInfo = {
  chainId: ChainId.SEPOLIA,
  id: SupportedNetwork.SEPOLIA,
  route: 'sepolia',
  name: 'Sepolia',
  bgColor: '#627eea',
  primaryColor: '#627eea',
  secondaryColor: '#2172E5',
  imageURL: ETHEREUM_LOGO_URL,
}

/** Info 与 Swap 对齐的可选链顺序（主网在前；测试网由「显示测试网」控制） */
export const INFO_INTERFACE_NETWORKS: NetworkInfo[] = [
  EthereumNetworkInfo,
  SepoliaNetworkInfo,
  PolygonNetworkInfo,
  BNBNetworkInfo,
  TtChainMainnetNetworkInfo,
  TtChainNetworkInfo,
]

/** @deprecated 使用 INFO_INTERFACE_NETWORKS */
export const SUPPORTED_NETWORK_VERSIONS: NetworkInfo[] = INFO_INTERFACE_NETWORKS
