import { ChainId } from '@vanadex/sdk-core'
import AppRpcProvider from 'rpc/AppRpcProvider'
import AppStaticJsonRpcProvider from 'rpc/StaticJsonRpcProvider'

import { TT_CHAIN_MAINNET_ID, SupportedInterfaceChain, TT_CHAIN_TESTNET_ID } from './chains'
import { RPC_URLS } from './networks'

const providerFactory = (chainId: SupportedInterfaceChain, i = 0) =>
  new AppStaticJsonRpcProvider(chainId, RPC_URLS[chainId][i])

/**
 * These are the only JsonRpcProviders used directly by the interface.
 */
export const RPC_PROVIDERS = {
  [ChainId.MAINNET]: new AppRpcProvider(ChainId.MAINNET, [
    providerFactory(ChainId.MAINNET),
    providerFactory(ChainId.MAINNET, 1),
  ]),
  // [ChainId.GOERLI]: providerFactory(ChainId.GOERLI),
  [ChainId.SEPOLIA]: new AppRpcProvider(ChainId.SEPOLIA, [
    providerFactory(ChainId.SEPOLIA),
    providerFactory(ChainId.SEPOLIA, 1),
  ]),
  // [ChainId.OPTIMISM]: providerFactory(ChainId.OPTIMISM),
  // [ChainId.OPTIMISM_GOERLI]: providerFactory(ChainId.OPTIMISM_GOERLI),
  // [ChainId.ARBITRUM_ONE]: providerFactory(ChainId.ARBITRUM_ONE),
  // [ChainId.ARBITRUM_GOERLI]: providerFactory(ChainId.ARBITRUM_GOERLI),
  [ChainId.POLYGON]: new AppRpcProvider(ChainId.POLYGON, [
    providerFactory(ChainId.POLYGON),
    providerFactory(ChainId.POLYGON, 1),
  ]),
  // [ChainId.POLYGON_MUMBAI]: providerFactory(ChainId.POLYGON_MUMBAI),
  // [ChainId.CELO]: providerFactory(ChainId.CELO),
  // [ChainId.CELO_ALFAJORES]: providerFactory(ChainId.CELO_ALFAJORES),
  [ChainId.BNB]: new AppRpcProvider(ChainId.BNB, [providerFactory(ChainId.BNB), providerFactory(ChainId.BNB, 1)]),
  // [ChainId.AVALANCHE]: providerFactory(ChainId.AVALANCHE),
  // [ChainId.BASE]: providerFactory(ChainId.BASE),
  [ChainId.VANA]: providerFactory(ChainId.VANA),
  [ChainId.VANA_MOKSHA]: providerFactory(ChainId.VANA_MOKSHA),
  [TT_CHAIN_MAINNET_ID]: providerFactory(TT_CHAIN_MAINNET_ID),
  [TT_CHAIN_TESTNET_ID]: providerFactory(TT_CHAIN_TESTNET_ID),
}
