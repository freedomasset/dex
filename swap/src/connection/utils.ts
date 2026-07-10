import BRAVE_ICON from 'assets/wallets/brave-icon.svg'
import INJECTED_DARK_ICON from 'assets/wallets/browser-wallet-dark.svg'
import INJECTED_LIGHT_ICON from 'assets/wallets/browser-wallet-light.svg'
import LEDGER_ICON from 'assets/wallets/ledger-icon.svg'
import METAMASK_ICON from 'assets/wallets/metamask-icon.svg'
import RABBY_ICON from 'assets/wallets/rabby-icon.svg'
import { Connection, ConnectionType } from 'connection/types'
import type { EIP1193Provider } from 'viem'

export const getIsInjected = () => Boolean(window.ethereum)

const InjectedWalletTable: { [key in keyof NonNullable<Window['ethereum']>]?: { name: string; icon: string } } = {
  isBraveWallet: { name: 'Brave', icon: BRAVE_ICON },
  isRabby: { name: 'Rabby', icon: RABBY_ICON },
  isLedgerConnect: { name: 'Ledger', icon: LEDGER_ICON },
  isTTChain: { name: 'TTChain Wallet', icon: INJECTED_LIGHT_ICON },
}

/**
 * Checks the window object for the presence of a known injectors and returns the most relevant injector name and icon.
 * Returns a default metamask installation object if no wallet is detected.
 *
 * @param isDarkMode - optional parameter to determine which color mode of the
 */
export function getInjection(isDarkMode?: boolean): { name: string; icon: string } {
  for (const [key, wallet] of Object.entries(InjectedWalletTable)) {
    if (window.ethereum?.[key as keyof Window['ethereum']]) return wallet
  }

  // Check for MetaMask last, as other injectors will also set this flag, i.e. Brave browser and Phantom wallet
  if (window.ethereum?.isMetaMask) return { name: 'MetaMask', icon: METAMASK_ICON }

  // Prompt metamask installation when there is no injection present or the only injection detected is coinbase (CB has separate entry point in UI)
  if (!window.ethereum || window.ethereum.isCoinbaseWallet) return { name: 'Install MetaMask', icon: METAMASK_ICON }

  // Use a generic icon when injection is present but no known non-coinbase wallet is detected
  return { name: 'Browser Wallet', icon: isDarkMode ? INJECTED_DARK_ICON : INJECTED_LIGHT_ICON }
}

/**
 * Returns true if `isMetaMask` is set to true and another non-metamask injector cannot be detected.
 *
 * Some non-metamask wallets set `isMetaMask` to true for dapp-compatability reasons. If one of these
 * injectors are detected, this function will return false.
 * https://wallet-docs.brave.com/ethereum/wallet-detection#compatability-with-metamask
 */
export const getIsMetaMaskWallet = () => getInjection().name === 'MetaMask'

export const getIsCoinbaseWallet = () => Boolean(window.ethereum?.isCoinbaseWallet)

// Global registry for EIP-6963 providers
interface EIP6963ProviderInfo {
  uuid: string
  name: string
  icon: string
  rdns: string
}

interface EIP6963ProviderDetail {
  info: EIP6963ProviderInfo
  provider: EIP1193Provider
}

// Store detected TTChain Wallet providers (EIP-6963)
const ttchainProviders = new Map<string, EIP1193Provider>()

// Initialize EIP-6963 listener on module load
if (typeof window !== 'undefined') {
  window.addEventListener('eip6963:announceProvider', ((event: CustomEvent<EIP6963ProviderDetail>) => {
    const { info, provider } = event.detail
    // 与扩展端一致：production rdns='com.ttchain'，development rdns='com.ttchain.test'（name 在 dev 可能为空）
    const rdnsMatch = info.rdns === 'com.ttchain' || info.rdns === 'com.ttchain.test'
    const nameMatch =
      (info.name && info.name.toLowerCase().includes('ttchain')) ||
      (info.name && info.name.toLowerCase().includes('tt chain'))
    const isTTChain = rdnsMatch || nameMatch || (provider as any).isTTChain
    if (isTTChain) ttchainProviders.set(info.uuid, provider)
  }) as EventListener)
  window.dispatchEvent(new Event('eip6963:requestProvider'))
}

export const getIsTTChainWallet = () => {
  if ((window as any).ethereum?.isTTChain) return true
  if ((window as any).ttchain) return true
  if (ttchainProviders.size > 0) return true
  return false
}

// https://eips.ethereum.org/EIPS/eip-1193#provider-errors
export enum ErrorCode {
  USER_REJECTED_REQUEST = 4001,
  UNAUTHORIZED = 4100,
  UNSUPPORTED_METHOD = 4200,
  DISCONNECTED = 4900,
  CHAIN_DISCONNECTED = 4901,

  // https://docs.metamask.io/guide/rpc-api.html#unrestricted-methods
  CHAIN_NOT_ADDED = 4902,
  MM_ALREADY_PENDING = -32002,
  CB_REJECTED_REQUEST = 'Error: User denied account authorization',
}

// TODO(WEB-1973): merge this function with existing didUserReject for Swap errors
export function didUserReject(connection: Connection, error: any): boolean {
  return (
    error?.code === ErrorCode.USER_REJECTED_REQUEST ||
    (connection.type === ConnectionType.COINBASE_WALLET && error?.toString?.() === ErrorCode.CB_REJECTED_REQUEST)
  )
}
