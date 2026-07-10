import type { Actions, Provider, ProviderConnectInfo, ProviderRpcError } from '@web3-react/types'
import { Connector } from '@web3-react/types'
import type { EIP1193Provider } from 'viem'

interface ChainBoxProvider extends EIP1193Provider {
  isChainBox?: boolean
}

interface ChainBoxProviderInfo {
  uuid: string
  name: string
  icon: string
  rdns: string
}

interface ChainBoxWalletDetail {
  info: ChainBoxProviderInfo
  provider: ChainBoxProvider
}

/**
 * ChainBox wallet connector using EIP-6963 standard
 */
// eslint-disable-next-line import/no-unused-modules
export class ChainBox extends Connector {
  private providerInfo?: ChainBoxProviderInfo
  private eagerConnection?: Promise<void>
  private chainBoxProvider?: ChainBoxProvider

  constructor({ actions, onError }: { actions: Actions; onError?: (error: Error) => void }) {
    super(actions, onError)
    this.startListening()
  }

  private startListening() {
    // Listen for EIP-6963 provider announcements
    window.addEventListener('eip6963:announceProvider', this.handleAnnounceProvider as EventListener)
    // Request providers
    window.dispatchEvent(new Event('eip6963:requestProvider'))
  }

  private handleAnnounceProvider = (event: Event) => {
    const { info, provider } = (event as CustomEvent).detail as ChainBoxWalletDetail

    // Check if this is ChainBox wallet
    if (info.name.toLowerCase().includes('chainbox') || provider.isChainBox) {
      this.chainBoxProvider = provider
      // @ts-ignore - provider is defined in base class
      this.provider = provider as Provider
      this.providerInfo = info

      // Check if we have a stored preference for ChainBox
      const storedProvider = localStorage.getItem('walletProvider')
      const persistedMeta = this.getPersistedConnectionMeta()

      // If we have a stored preference or persisted connection meta, try to restore connection
      if (storedProvider === info.name || persistedMeta?.type === 'CHAINBOX') {
        this.setupProvider()
        // Try to restore connection state
        this.restoreConnection()
      }
    }
  }

  private getPersistedConnectionMeta() {
    try {
      const value = localStorage.getItem('connection_meta')
      if (value) {
        return JSON.parse(value) as { type: string; address?: string; ENSName?: string }
      }
    } catch (e) {
      // Ignore errors
    }
    return null
  }

  private async restoreConnection() {
    if (!this.chainBoxProvider) return

    try {
      // Check if already connected
      const accounts = (await this.chainBoxProvider.request({
        method: 'eth_accounts',
      })) as string[]

      if (accounts.length > 0) {
        const chainId = (await this.chainBoxProvider.request({
          method: 'eth_chainId',
        })) as string

        this.actions.update({ chainId: this.parseChainId(chainId), accounts })
      }
    } catch (error) {
      console.debug('Failed to restore ChainBox connection:', error)
    }
  }

  private async setupProvider() {
    if (!this.chainBoxProvider) return

    // Set up event listeners
    this.chainBoxProvider.on('connect', this.handleConnect)
    this.chainBoxProvider.on('disconnect', this.handleDisconnect)
    this.chainBoxProvider.on('chainChanged', this.handleChainChanged)
    this.chainBoxProvider.on('accountsChanged', this.handleAccountsChanged)
  }

  private removeProviderListeners() {
    if (!this.chainBoxProvider) return

    this.chainBoxProvider.removeListener('connect', this.handleConnect)
    this.chainBoxProvider.removeListener('disconnect', this.handleDisconnect)
    this.chainBoxProvider.removeListener('chainChanged', this.handleChainChanged)
    this.chainBoxProvider.removeListener('accountsChanged', this.handleAccountsChanged)
  }

  private handleConnect = (connectInfo: ProviderConnectInfo | any) => {
    try {
      // Handle different formats of connectInfo
      let chainId: string | number | undefined

      if (typeof connectInfo === 'string') {
        // If connectInfo is directly a chainId string
        chainId = connectInfo
      } else if (connectInfo && typeof connectInfo === 'object') {
        // If connectInfo is an object with chainId property
        if (typeof connectInfo.chainId === 'string' || typeof connectInfo.chainId === 'number') {
          chainId = connectInfo.chainId
        } else if (connectInfo.chainId && typeof connectInfo.chainId === 'object') {
          // Some providers might wrap chainId in an object - skip this event
          // The chainId will be fetched in activate() method instead
          console.debug('Skipping connect event with object chainId, will fetch from provider')
          return
        } else {
          // No chainId in connectInfo - fetch from provider asynchronously
          console.debug('No chainId in connect event, fetching from provider')
          this.chainBoxProvider
            ?.request({ method: 'eth_chainId' })
            .then((chainIdResult) => {
              if (chainIdResult) {
                this.actions.update({ chainId: this.parseChainId(chainIdResult as string) })
              }
            })
            .catch((error) => {
              console.debug('Failed to fetch chainId from provider:', error)
            })
          return
        }
      } else {
        // Invalid connectInfo format - skip
        console.debug('Invalid connectInfo format, skipping connect event')
        return
      }

      // Only update if we have a valid chainId
      if (chainId !== undefined) {
        const parsedChainId = this.parseChainId(chainId)
        if (!isNaN(parsedChainId) && parsedChainId > 0) {
          this.actions.update({ chainId: parsedChainId })
        }
      }
    } catch (error) {
      // Silently handle errors in connect event - the activate() method will handle chainId properly
      console.debug('Error handling connect event:', error)
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
    if (accounts.length === 0) {
      this.actions.resetState()
    } else {
      this.actions.update({ accounts })
    }
  }

  private parseChainId(chainId: string | number) {
    return typeof chainId === 'string' ? Number.parseInt(chainId, chainId.startsWith('0x') ? 16 : 10) : chainId
  }

  async connectEagerly(): Promise<void> {
    const cancelActivation = this.actions.startActivation()

    try {
      // Wait for EIP-6963 providers to announce (with retries)
      let retries = 10 // Try for up to 1 second (10 * 100ms)
      while (!this.chainBoxProvider && retries > 0) {
        await new Promise((resolve) => setTimeout(resolve, 100))
        retries--
      }

      // If provider not found, don't throw error - just return silently
      // This prevents clearing the persisted connection state
      if (!this.chainBoxProvider) {
        console.debug('ChainBox provider not found during eager connection, will retry on next interaction')
        cancelActivation()
        return
      }

      // Check if already connected
      const accounts = (await this.chainBoxProvider.request({
        method: 'eth_accounts',
      })) as string[]

      if (accounts.length > 0) {
        const chainId = (await this.chainBoxProvider.request({
          method: 'eth_chainId',
        })) as string

        this.setupProvider()
        this.actions.update({ chainId: this.parseChainId(chainId), accounts })
        if (this.providerInfo) {
          localStorage.setItem('walletProvider', this.providerInfo.name)
        }
      } else {
        // No accounts connected, cancel activation
        cancelActivation()
      }
    } catch (error) {
      cancelActivation()
      // Don't throw error - just log it
      // This prevents clearing the persisted connection state on transient errors
      console.debug('ChainBox eager connection error:', error)
    }
  }

  async activate(desiredChainIdOrChainParameters?: number | AddEthereumChainParameter): Promise<void> {
    const cancelActivation = this.actions.startActivation()

    try {
      // Wait a bit for EIP-6963 providers to announce if not already found
      if (!this.chainBoxProvider) {
        await new Promise((resolve) => setTimeout(resolve, 500))
      }

      if (!this.chainBoxProvider) {
        throw new Error('ChainBox wallet not found. Please install ChainBox wallet extension.')
      }

      // Request accounts
      const accounts = (await this.chainBoxProvider.request({
        method: 'eth_requestAccounts',
      })) as string[]

      if (accounts.length === 0) {
        throw new Error('No accounts returned')
      }

      // Get current chain ID
      const chainId = (await this.chainBoxProvider.request({
        method: 'eth_chainId',
      })) as string

      const currentChainId = this.parseChainId(chainId)

      // Switch chain if desired chain ID is provided and different
      if (desiredChainIdOrChainParameters) {
        const desiredChainId =
          typeof desiredChainIdOrChainParameters === 'number'
            ? desiredChainIdOrChainParameters
            : this.parseChainId(desiredChainIdOrChainParameters.chainId)

        if (currentChainId !== desiredChainId) {
          try {
            await this.chainBoxProvider.request({
              method: 'wallet_switchEthereumChain',
              params: [{ chainId: `0x${desiredChainId.toString(16)}` }],
            })
          } catch (switchError: any) {
            // If chain doesn't exist, try to add it
            if (switchError.code === 4902 && typeof desiredChainIdOrChainParameters !== 'number') {
              const addChainParams = {
                ...desiredChainIdOrChainParameters,
                chainId: `0x${desiredChainIdOrChainParameters.chainId.toString(16)}`,
              }
              await this.chainBoxProvider.request({
                method: 'wallet_addEthereumChain',
                params: [addChainParams],
              })
            } else {
              throw switchError
            }
          }
        }
      }

      // Set up provider listeners
      this.setupProvider()

      // Update state
      const finalChainId = desiredChainIdOrChainParameters
        ? typeof desiredChainIdOrChainParameters === 'number'
          ? desiredChainIdOrChainParameters
          : this.parseChainId(desiredChainIdOrChainParameters.chainId)
        : currentChainId

      this.actions.update({
        chainId: finalChainId,
        accounts,
      })

      // Store provider preference
      if (this.providerInfo) {
        localStorage.setItem('walletProvider', this.providerInfo.name)
      }
    } catch (error) {
      cancelActivation()
      throw error
    }
  }

  async deactivate(): Promise<void> {
    this.removeProviderListeners()

    // Try to revoke permissions
    if (this.chainBoxProvider) {
      try {
        await this.chainBoxProvider.request({
          method: 'wallet_revokePermissions',
          params: [{ eth_accounts: {} }],
        })
      } catch (error) {
        // Ignore errors when revoking permissions
        console.debug('Failed to revoke permissions:', error)
      }
    }

    // Clear stored preference
    if (this.providerInfo) {
      localStorage.removeItem('walletProvider')
    }

    this.actions.resetState()
  }
}

interface AddEthereumChainParameter {
  chainId: string | number
  chainName: string
  nativeCurrency: {
    name: string
    symbol: string
    decimals: number
  }
  rpcUrls: string[]
  blockExplorerUrls?: string[]
}
