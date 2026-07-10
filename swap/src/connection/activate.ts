import { ChainId } from '@vanadex/sdk-core'
import { Connection, ConnectionType } from 'connection/types'
import { getChainInfo } from 'constants/chainInfo'
import {
  getAppChainId,
  isSupportedChain,
  TT_CHAIN_MAINNET_ID,
  SupportedInterfaceChain,
  TT_CHAIN_TESTNET_ID,
} from 'constants/chains'
import { FALLBACK_URLS, RPC_URLS } from 'constants/networks'
import { atom, useAtomValue, useSetAtom } from 'jotai'
import { useCallback } from 'react'
import { useAppDispatch } from 'state/hooks'
import { updateSelectedWallet } from 'state/user/reducer'

import { didUserReject } from './utils'

function getRpcUrl(chainId: SupportedInterfaceChain): string {
  switch (chainId) {
    case ChainId.MAINNET:
    case ChainId.SEPOLIA:
    case ChainId.POLYGON:
    case ChainId.BNB:
      return RPC_URLS[chainId][0]
    case ChainId.VANA:
      return RPC_URLS[chainId][0]
    case ChainId.VANA_MOKSHA:
      return RPC_URLS[chainId][0]
    case TT_CHAIN_MAINNET_ID:
    case TT_CHAIN_TESTNET_ID:
      return RPC_URLS[chainId]?.[0] || FALLBACK_URLS[chainId]?.[0] || ''
    default:
      return FALLBACK_URLS[chainId]?.[0] || ''
  }
}

export enum ActivationStatus {
  PENDING,
  ERROR,
  IDLE,
}

type ActivationPendingState = { status: ActivationStatus.PENDING; connection: Connection }
type ActivationErrorState = { status: ActivationStatus.ERROR; connection: Connection; error: any }
const IDLE_ACTIVATION_STATE = { status: ActivationStatus.IDLE } as const
type ActivationState = ActivationPendingState | ActivationErrorState | typeof IDLE_ACTIVATION_STATE

const activationStateAtom = atom<ActivationState>(IDLE_ACTIVATION_STATE)

function useTryActivation() {
  const dispatch = useAppDispatch()
  const setActivationState = useSetAtom(activationStateAtom)

  return useCallback(
    async (connection: Connection, onSuccess: () => void, chainId?: ChainId) => {
      // Skips wallet connection if the connection should override the default
      // behavior, i.e. install MetaMask or launch Coinbase app
      console.log('connection', connection)
      if (connection.overrideActivate?.(chainId)) return

      try {
        setActivationState({ status: ActivationStatus.PENDING, connection })
        console.log('connection.connector', connection.connector)
        console.log('chainId', chainId)
        console.debug(`Connection activating: ${connection.getName()}`)
        dispatch(updateSelectedWallet({ wallet: undefined }))
        console.log('connection.connector.activate', connection.connector.activate)

        // Use app chain (env: prod=主网, dev/test=测试网) if no chainId is provided
        const targetChainId = chainId ?? getAppChainId()

        // For connectors that support AddEthereumChainParameter (MetaMask, Coinbase, TTChain Wallet),
        // pass chain params so that on error 4902 (unrecognized chain) the wallet can add the network.
        const supportsAddChain =
          connection.type === ConnectionType.INJECTED ||
          connection.type === ConnectionType.COINBASE_WALLET ||
          connection.type === ConnectionType.TTCHAIN_WALLET
        if (supportsAddChain && isSupportedChain(targetChainId)) {
          const info = getChainInfo(targetChainId)
          const addChainParameter = {
            chainId: targetChainId,
            chainName: info.label,
            rpcUrls: [getRpcUrl(targetChainId)],
            nativeCurrency: info.nativeCurrency,
            blockExplorerUrls: [info.explorer],
          }
          await connection.connector.activate(addChainParameter)
        } else {
          await connection.connector.activate(targetChainId)
        }

        console.debug(`Connection activated: ${connection.getName()}`)
        dispatch(updateSelectedWallet({ wallet: connection.type }))

        // Clears pending connection state
        setActivationState(IDLE_ACTIVATION_STATE)

        onSuccess()
      } catch (error) {
        // Gracefully handles errors from the user rejecting a connection attempt
        if (didUserReject(connection, error)) {
          setActivationState(IDLE_ACTIVATION_STATE)
          return
        }

        // TODO(WEB-1859): re-add special treatment for already-pending injected errors & move debug to after didUserReject() check
        console.debug(`Connection failed: ${connection.getName()}`)
        console.error(error)

        setActivationState({ status: ActivationStatus.ERROR, connection, error })
      }
    },
    [dispatch, setActivationState]
  )
}

function useCancelActivation() {
  const setActivationState = useSetAtom(activationStateAtom)
  return useCallback(
    () =>
      setActivationState((activationState) => {
        if (activationState.status !== ActivationStatus.IDLE) activationState.connection.connector.deactivate?.()
        return IDLE_ACTIVATION_STATE
      }),
    [setActivationState]
  )
}

export function useActivationState() {
  const activationState = useAtomValue(activationStateAtom)
  const tryActivation = useTryActivation()
  const cancelActivation = useCancelActivation()

  return { activationState, tryActivation, cancelActivation }
}
