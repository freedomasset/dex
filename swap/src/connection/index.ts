import { ChainId } from '@vanadex/sdk-core'
import { CoinbaseWallet } from '@web3-react/coinbase-wallet'
import { initializeConnector } from '@web3-react/core'
import { GnosisSafe } from '@web3-react/gnosis-safe'
import { MetaMask } from '@web3-react/metamask'
import { Network } from '@web3-react/network'
import { Actions, Connector } from '@web3-react/types'
import GNOSIS_ICON from 'assets/images/gnosis.png'
import HORSWAP_LOGO from 'assets/svg/logo.svg'
import COINBASE_ICON from 'assets/wallets/coinbase-icon.svg'
import WALLET_CONNECT_ICON from 'assets/wallets/walletconnect-icon.svg'
import { useSyncExternalStore } from 'react' // Make sure this import is from 'react'
import { isMobile } from 'utils/userAgent'

import { getAppChainId } from '../constants/chains'
import { RPC_URLS } from '../constants/networks'
import { RPC_PROVIDERS } from '../constants/providers'
import { wallet_icon as ttchainWalletIcon } from './ttchainIcon'
import { TTChainWallet } from './TTChainWallet'
import { Connection, ConnectionType } from './types'
import { getInjection, getIsCoinbaseWallet, getIsInjected, getIsMetaMaskWallet, getIsTTChainWallet } from './utils'
import { WalletConnectV2 } from './WalletConnectV2'

function onError(error: Error) {
  console.debug(`web3-react error: ${error}`)
}

const [web3Network, web3NetworkHooks] = initializeConnector<Network>(
  (actions) => new Network({ actions, urlMap: RPC_PROVIDERS, defaultChainId: getAppChainId() })
)
export const networkConnection: Connection = {
  getName: () => 'Network',
  connector: web3Network,
  hooks: web3NetworkHooks,
  type: ConnectionType.NETWORK,
  shouldDisplay: () => false,
}

const getIsCoinbaseWalletBrowser = () => isMobile && getIsCoinbaseWallet()
const getIsMetaMaskBrowser = () => isMobile && getIsMetaMaskWallet()
const getIsInjectedMobileBrowser = () => getIsCoinbaseWalletBrowser() || getIsMetaMaskBrowser()
console.log('getIsInjectedMobileBrowser', getIsInjectedMobileBrowser())
const getShouldAdvertiseMetaMask = () =>
  !getIsMetaMaskWallet() && !isMobile && (!getIsInjected() || getIsCoinbaseWallet())
const getIsGenericInjector = () => getIsInjected() && !getIsMetaMaskWallet() && !getIsCoinbaseWallet()

const [web3Injected, web3InjectedHooks] = initializeConnector<MetaMask>((actions) => new MetaMask({ actions, onError }))

export const injectedConnection: Connection = {
  getName: () => getInjection().name,
  connector: web3Injected,
  hooks: web3InjectedHooks,
  type: ConnectionType.INJECTED,
  getIcon: (isDarkMode: boolean) => getInjection(isDarkMode).icon,
  shouldDisplay: () => getIsMetaMaskWallet() || getShouldAdvertiseMetaMask() || getIsGenericInjector(),
  // If on non-injected, non-mobile browser, prompt user to install Metamask
  overrideActivate: () => {
    if (getShouldAdvertiseMetaMask()) {
      window.open('https://metamask.io/', 'inst_metamask')
      return true
    }
    return false
  },
}
const [web3GnosisSafe, web3GnosisSafeHooks] = initializeConnector<GnosisSafe>((actions) => new GnosisSafe({ actions }))
export const gnosisSafeConnection: Connection = {
  getName: () => 'Gnosis Safe',
  connector: web3GnosisSafe,
  hooks: web3GnosisSafeHooks,
  type: ConnectionType.GNOSIS_SAFE,
  getIcon: () => GNOSIS_ICON,
  shouldDisplay: () => false,
}

export const walletConnectV2Connection: Connection = new (class implements Connection {
  private initializer = (actions: Actions, defaultChainId = getAppChainId()) =>
    new WalletConnectV2({ actions, defaultChainId, onError })

  type = ConnectionType.WALLET_CONNECT_V2
  getName = () => 'WalletConnect'
  getIcon = () => WALLET_CONNECT_ICON
  shouldDisplay = () => !getIsInjectedMobileBrowser()

  private activeConnector = initializeConnector<WalletConnectV2>(this.initializer)
  // The web3-react Provider requires referentially stable connectors, so we use proxies to allow lazy connections
  // whilst maintaining referential equality.
  private proxyConnector = new Proxy(
    {},
    {
      get: (target, p, receiver) => Reflect.get(this.activeConnector[0], p, receiver),
      getOwnPropertyDescriptor: (target, p) => Reflect.getOwnPropertyDescriptor(this.activeConnector[0], p),
      getPrototypeOf: () => WalletConnectV2.prototype,
      set: (target, p, receiver) => Reflect.set(this.activeConnector[0], p, receiver),
    }
  ) as (typeof this.activeConnector)[0]
  private proxyHooks = new Proxy(
    {},
    {
      get: (target, p, receiver) => {
        return () => {
          // Because our connectors are referentially stable (through proxying), we need a way to trigger React renders
          // from outside of the React lifecycle when our connector is re-initialized. This is done via 'change' events
          // with `useSyncExternalStore`:
          const hooks = useSyncExternalStore(
            (onChange) => {
              this.onActivate = onChange
              return () => (this.onActivate = undefined)
            },
            () => this.activeConnector[1]
          )
          return Reflect.get(hooks, p, receiver)()
        }
      },
    }
  ) as (typeof this.activeConnector)[1]

  private onActivate?: () => void

  overrideActivate = (chainId?: ChainId) => {
    // Always re-create the connector, so that the chainId is updated.
    this.activeConnector = initializeConnector((actions) => this.initializer(actions, chainId))
    this.onActivate?.()
    return false
  }

  get connector() {
    return this.proxyConnector
  }
  get hooks() {
    return this.proxyHooks
  }
})()

const [web3CoinbaseWallet, web3CoinbaseWalletHooks] = initializeConnector<CoinbaseWallet>(
  (actions) =>
    new CoinbaseWallet({
      actions,
      options: {
        url: RPC_URLS[ChainId.VANA_MOKSHA][0],
        appName: 'Vana Data DEX',
        appLogoUrl: HORSWAP_LOGO,
        reloadOnDisconnect: false,
      },
      onError,
    })
)
const coinbaseWalletConnection: Connection = {
  getName: () => 'Coinbase Wallet',
  connector: web3CoinbaseWallet,
  hooks: web3CoinbaseWalletHooks,
  type: ConnectionType.COINBASE_WALLET,
  getIcon: () => COINBASE_ICON,
  shouldDisplay: () =>
    Boolean((isMobile && !getIsInjectedMobileBrowser()) || !isMobile || getIsCoinbaseWalletBrowser()),
  // If on a mobile browser that isn't the coinbase wallet browser, deeplink to the coinbase wallet app
  overrideActivate: () => {
    if (isMobile && !getIsInjectedMobileBrowser()) {
      window.open('https://go.cb-w.com/mtUDhEZPy1', 'cbwallet')
      return true
    }
    return false
  },
}

// TTChain Wallet connector (EIP-6963 + window.ttchain / window.ethereum.isTTChain)
const [web3TTChainWallet, web3TTChainWalletHooks] = initializeConnector<TTChainWallet>(
  (actions) => new TTChainWallet({ actions, onError })
)
// eslint-disable-next-line import/no-unused-modules
export const ttchainWalletConnection: Connection = {
  getName: () => 'TTChain Wallet',
  connector: web3TTChainWallet,
  hooks: web3TTChainWalletHooks,
  type: ConnectionType.TTCHAIN_WALLET,
  getIcon: () => ttchainWalletIcon,
  shouldDisplay: () => true,
  overrideActivate: () => {
    if (getIsTTChainWallet()) return false
    window.dispatchEvent(new Event('eip6963:requestProvider'))
    const isInIframe = (() => {
      try {
        return window.self !== window.top
      } catch {
        return true
      }
    })()
    if (isInIframe) return false
    const isEdge = /edg\/|edga\/|edgios\/|edge\//.test(navigator.userAgent.toLowerCase())
    if (isEdge) {
      window.open(
        'https://chromewebstore.google.com/detail/ttchain-wallet/hbcaeldjiijffnglkaegjdkabipajfje?hl=zh-CN&utm_source=ext_sidebar',
        'ttchain_download'
      )
    } else {
      window.open(
        'https://chromewebstore.google.com/detail/ttchain-wallet/hbcaeldjiijffnglkaegjdkabipajfje?hl=zh-CN&utm_source=ext_sidebar',
        'ttchain_download'
      )
    }
    return true
  },
}

export const connections = [
  ttchainWalletConnection,
  gnosisSafeConnection,
  injectedConnection,
  coinbaseWalletConnection,
  walletConnectV2Connection,
  networkConnection,
]

export function getConnection(c: Connector | ConnectionType) {
  if (c instanceof Connector) {
    const connection = connections.find((connection) => connection.connector === c)
    if (!connection) {
      throw Error('unsupported connector')
    }
    return connection
  } else {
    switch (c) {
      case ConnectionType.INJECTED:
        return injectedConnection
      case ConnectionType.COINBASE_WALLET:
        return coinbaseWalletConnection
      case ConnectionType.NETWORK:
        return networkConnection
      case ConnectionType.GNOSIS_SAFE:
        return gnosisSafeConnection
      case ConnectionType.WALLET_CONNECT_V2:
        return walletConnectV2Connection
      case ConnectionType.TTCHAIN_WALLET:
        return ttchainWalletConnection
    }
  }
}
