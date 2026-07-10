import type { Actions, Provider, ProviderConnectInfo, ProviderRpcError } from '@web3-react/types'
import { Connector } from '@web3-react/types'
import type { EIP1193Provider } from 'viem'

interface TTChainProvider extends EIP1193Provider {
  isTTChain?: boolean
}

interface TTChainProviderInfo {
  uuid: string
  name: string
  icon: string
  rdns: string
}

interface TTChainWalletDetail {
  info: TTChainProviderInfo
  provider: TTChainProvider
}

declare global {
  interface Window {
    ttchain?: EIP1193Provider & { isTTChain?: boolean }
  }
}

/**
 * TTChain Wallet connector (EIP-6963 + window.ttchain / window.ethereum.isTTChain)
 */
// eslint-disable-next-line import/no-unused-modules
export class TTChainWallet extends Connector {
  private providerInfo?: TTChainProviderInfo
  private eagerConnection?: Promise<void>
  private ttchainProvider?: TTChainProvider

  constructor({ actions, onError }: { actions: Actions; onError?: (error: Error) => void }) {
    super(actions, onError)
    this.startListening()
  }

  /** 与扩展端 EIP-6963 一致：production 为 name='TTChain Wallet' / rdns='com.ttchain'，development 为 rdns='com.ttchain.test'（name 可能为空） */
  private static isTTChainProvider(info: { name: string; rdns?: string }, provider: TTChainProvider): boolean {
    const rdnsMatch = info.rdns === 'com.ttchain' || info.rdns === 'com.ttchain.test'
    const nameMatch =
      (info.name && info.name.toLowerCase().includes('ttchain')) ||
      (info.name && info.name.toLowerCase().includes('tt chain'))
    return Boolean(rdnsMatch || nameMatch || provider.isTTChain)
  }

  private startListening() {
    window.addEventListener('eip6963:announceProvider', this.handleAnnounceProvider as EventListener)
    window.dispatchEvent(new Event('eip6963:requestProvider'))
    this.tryUseInjected()
  }

  private tryUseInjected() {
    if (typeof window === 'undefined') return
    const ethereum = (window as any).ethereum
    if (ethereum?.isTTChain && !this.ttchainProvider) {
      this.ttchainProvider = ethereum as TTChainProvider
      this.provider = ethereum as Provider
      this.providerInfo = {
        uuid: 'ttchain-injected',
        name: 'TTChain Wallet',
        icon: '',
        rdns: 'com.ttchain',
      }
      this.setupProvider()
      this.restoreConnection()
      return
    }
    if ((window as any).ttchain && !this.ttchainProvider) {
      const w = (window as any).ttchain
      this.ttchainProvider = w as TTChainProvider
      this.provider = w as Provider
      this.providerInfo = {
        uuid: 'ttchain-window',
        name: 'TTChain Wallet',
        icon: '',
        rdns: 'com.ttchain',
      }
      this.setupProvider()
      this.restoreConnection()
    }
  }

  private handleAnnounceProvider = (event: Event) => {
    const { info, provider } = (event as CustomEvent).detail as TTChainWalletDetail
    if (!TTChainWallet.isTTChainProvider(info, provider)) return
    if (this.ttchainProvider) return
    this.ttchainProvider = provider
    this.provider = provider as Provider
    this.providerInfo = info
    const storedProvider = localStorage.getItem('walletProvider')
    const persistedMeta = this.getPersistedConnectionMeta()
    if (storedProvider === info.name || persistedMeta?.type === 'TTCHAIN_WALLET') {
      this.setupProvider()
      this.restoreConnection()
    }
  }

  private getPersistedConnectionMeta() {
    try {
      const value = localStorage.getItem('connection_meta')
      if (value) return JSON.parse(value) as { type: string; address?: string; ENSName?: string }
    } catch {
      // ignore
    }
    return null
  }

  private async restoreConnection() {
    if (!this.ttchainProvider) return
    try {
      const accounts = (await this.ttchainProvider.request({ method: 'eth_accounts' })) as string[]
      if (accounts.length > 0) {
        const chainId = (await this.ttchainProvider.request({ method: 'eth_chainId' })) as string
        this.actions.update({ chainId: this.parseChainId(chainId), accounts })
      }
    } catch (error) {
      console.debug('Failed to restore TTChain Wallet connection:', error)
    }
  }

  private async setupProvider() {
    if (!this.ttchainProvider) return
    this.ttchainProvider.on?.('connect', this.handleConnect)
    this.ttchainProvider.on?.('disconnect', this.handleDisconnect)
    this.ttchainProvider.on?.('chainChanged', this.handleChainChanged)
    this.ttchainProvider.on?.('accountsChanged', this.handleAccountsChanged)
  }

  private removeProviderListeners() {
    if (!this.ttchainProvider) return
    this.ttchainProvider.removeListener?.('connect', this.handleConnect)
    this.ttchainProvider.removeListener?.('disconnect', this.handleDisconnect)
    this.ttchainProvider.removeListener?.('chainChanged', this.handleChainChanged)
    this.ttchainProvider.removeListener?.('accountsChanged', this.handleAccountsChanged)
  }

  private handleConnect = (connectInfo: ProviderConnectInfo | any) => {
    try {
      let chainId: string | number | undefined
      if (typeof connectInfo === 'string') chainId = connectInfo
      else if (connectInfo?.chainId != null) chainId = connectInfo.chainId
      if (chainId != null) {
        const parsed = this.parseChainId(chainId)
        if (!isNaN(parsed) && parsed > 0) this.actions.update({ chainId: parsed })
      }
    } catch (e) {
      console.debug('TTChain connect event error:', e)
    }
  }

  private handleDisconnect = (error: ProviderRpcError) => {
    this.actions.resetState()
    if (error) this.onError?.(error)
  }

  private handleChainChanged = (chainId: string) => {
    this.actions.update({ chainId: this.parseChainId(chainId) })
  }

  private handleAccountsChanged = (accounts: string[]) => {
    if (accounts.length === 0) this.actions.resetState()
    else this.actions.update({ accounts })
  }

  private parseChainId(chainId: string | number) {
    return typeof chainId === 'string' ? Number.parseInt(chainId, chainId.startsWith('0x') ? 16 : 10) : chainId
  }

  async connectEagerly(): Promise<void> {
    const cancelActivation = this.actions.startActivation()
    try {
      this.tryUseInjected()
      let retries = 10
      while (!this.ttchainProvider && retries > 0) {
        await new Promise((r) => setTimeout(r, 100))
        retries--
      }
      if (!this.ttchainProvider) {
        cancelActivation()
        return
      }
      const accounts = (await this.ttchainProvider.request({ method: 'eth_accounts' })) as string[]
      if (accounts.length > 0) {
        const chainId = (await this.ttchainProvider.request({ method: 'eth_chainId' })) as string
        this.setupProvider()
        this.actions.update({ chainId: this.parseChainId(chainId), accounts })
        if (this.providerInfo) localStorage.setItem('walletProvider', this.providerInfo.name)
      } else {
        cancelActivation()
      }
    } catch (error) {
      cancelActivation()
      console.debug('TTChain Wallet eager connection error:', error)
    }
  }

  async activate(desiredChainIdOrChainParameters?: number | AddEthereumChainParameter): Promise<void> {
    const cancelActivation = this.actions.startActivation()
    try {
      this.tryUseInjected()
      if (!this.ttchainProvider) {
        await new Promise((r) => setTimeout(r, 500))
      }
      if (!this.ttchainProvider) {
        throw new Error('TTChain Wallet 未检测到，请安装 TTChain Wallet 扩展。')
      }
      const accounts = (await this.ttchainProvider.request({ method: 'eth_requestAccounts' })) as string[]
      if (accounts.length === 0) throw new Error('No accounts returned')
      const chainId = (await this.ttchainProvider.request({ method: 'eth_chainId' })) as string
      const currentChainId = this.parseChainId(chainId)
      if (desiredChainIdOrChainParameters) {
        const desiredChainId =
          typeof desiredChainIdOrChainParameters === 'number'
            ? desiredChainIdOrChainParameters
            : this.parseChainId(desiredChainIdOrChainParameters.chainId)
        if (currentChainId !== desiredChainId) {
          try {
            await this.ttchainProvider.request({
              method: 'wallet_switchEthereumChain',
              params: [{ chainId: `0x${desiredChainId.toString(16)}` }],
            })
          } catch (switchError: any) {
            if (switchError?.code === 4902 && typeof desiredChainIdOrChainParameters !== 'number') {
              const p = desiredChainIdOrChainParameters
              await this.ttchainProvider.request({
                method: 'wallet_addEthereumChain',
                params: [{ ...p, chainId: `0x${p.chainId.toString(16)}` }],
              })
            } else throw switchError
          }
        }
      }
      this.setupProvider()
      const finalChainId = desiredChainIdOrChainParameters
        ? typeof desiredChainIdOrChainParameters === 'number'
          ? desiredChainIdOrChainParameters
          : this.parseChainId(desiredChainIdOrChainParameters.chainId)
        : currentChainId
      this.actions.update({ chainId: finalChainId, accounts })
      if (this.providerInfo) localStorage.setItem('walletProvider', this.providerInfo.name)
    } catch (error) {
      cancelActivation()
      throw error
    }
  }

  async deactivate(): Promise<void> {
    this.removeProviderListeners()
    if (this.ttchainProvider) {
      try {
        await this.ttchainProvider.request({ method: 'wallet_revokePermissions', params: [{ eth_accounts: {} }] })
      } catch {
        // ignore
      }
    }
    if (this.providerInfo) localStorage.removeItem('walletProvider')
    this.actions.resetState()
  }
}

interface AddEthereumChainParameter {
  chainId: string | number
  chainName: string
  nativeCurrency: { name: string; symbol: string; decimals: number }
  rpcUrls: string[]
  blockExplorerUrls?: string[]
}
