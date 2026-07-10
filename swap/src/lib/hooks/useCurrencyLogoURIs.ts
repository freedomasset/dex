import { ChainId } from '@vanadex/sdk-core'
import useHttpLocations from 'hooks/useHttpLocations'
import { useMemo } from 'react'
import { isAddress } from 'utils'

import ethereumLogoUrl from '../../assets/images/ethereum-logo.png'
import VanaLogo from '../../assets/images/vana.png'
import AvaxLogo from '../../assets/svg/avax_logo.svg'
import BnbLogo from '../../assets/svg/bnb-logo.svg'
import CeloLogo from '../../assets/svg/celo_logo.svg'
import MaticLogo from '../../assets/svg/matic-token-icon.svg'
import { wallet_icon as ttchainWalletIcon } from '../../connection/ttchainIcon'
import { getAppChainId, TT_CHAIN_MAINNET_ID, TT_CHAIN_TESTNET_ID } from '../../constants/chains'
import { isCelo, NATIVE_CHAIN_ID, nativeOnChain } from '../../constants/tokens'

type Network = 'ethereum' | 'arbitrum' | 'optimism' | 'polygon' | 'smartchain' | 'celo' | 'avalanchec' | 'vana'

export function chainIdToNetworkName(networkId: ChainId): Network {
  switch (networkId) {
    case ChainId.MAINNET:
      return 'ethereum'
    case ChainId.ARBITRUM_ONE:
      return 'arbitrum'
    case ChainId.OPTIMISM:
      return 'optimism'
    case ChainId.POLYGON:
      return 'polygon'
    case ChainId.BNB:
      return 'smartchain'
    case ChainId.CELO:
      return 'celo'
    case ChainId.AVALANCHE:
      return 'avalanchec'
    case ChainId.VANA:
      return 'vana'
    case ChainId.VANA_MOKSHA:
      return 'vana'
    default:
      return 'ethereum'
  }
}

export function getNativeLogoURI(chainId: ChainId | number = getAppChainId()): string {
  switch (chainId) {
    case ChainId.MAINNET:
    case ChainId.SEPOLIA:
    case ChainId.GOERLI:
      return ethereumLogoUrl
    case ChainId.POLYGON:
    case ChainId.POLYGON_MUMBAI:
      return MaticLogo
    case ChainId.BNB:
      return BnbLogo
    case ChainId.CELO:
    case ChainId.CELO_ALFAJORES:
      return CeloLogo
    case ChainId.AVALANCHE:
      return AvaxLogo
    case ChainId.VANA:
      return VanaLogo
    case ChainId.VANA_MOKSHA:
      return VanaLogo
    case TT_CHAIN_MAINNET_ID:
    case TT_CHAIN_TESTNET_ID:
      return ttchainWalletIcon
    default:
      return VanaLogo
  }
}

function getTokenLogoURI(address: string, chainId: ChainId = ChainId.MAINNET): string | void {
  const networkName = chainIdToNetworkName(chainId)
  const networksWithUrls = [ChainId.ARBITRUM_ONE, ChainId.MAINNET, ChainId.OPTIMISM, ChainId.BNB, ChainId.AVALANCHE]
  if (isCelo(chainId) && address === nativeOnChain(chainId).wrapped.address) {
    return CeloLogo
  }

  if (networksWithUrls.includes(chainId)) {
    return `https://raw.githubusercontent.com/Uniswap/assets/master/blockchains/${networkName}/assets/${address}/logo.png`
  }
}

export default function useCurrencyLogoURIs(
  currency:
    | {
        isNative?: boolean
        isToken?: boolean
        address?: string
        chainId: number
        logoURI?: string | null
      }
    | null
    | undefined
): string[] {
  const locations = useHttpLocations(currency?.logoURI)
  return useMemo(() => {
    const logoURIs = [...locations]
    if (currency) {
      if (currency.isNative || currency.address === NATIVE_CHAIN_ID) {
        logoURIs.push(getNativeLogoURI(currency.chainId))
      } else if (currency.isToken || currency.address) {
        const checksummedAddress = isAddress(currency.address)
        const logoURI = checksummedAddress && getTokenLogoURI(checksummedAddress, currency.chainId)
        if (logoURI) {
          logoURIs.push(logoURI)
        }
      }
    }
    return logoURIs
  }, [currency, locations])
}
