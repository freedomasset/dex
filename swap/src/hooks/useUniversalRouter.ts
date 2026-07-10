import { BigNumber } from '@ethersproject/bignumber'
import { t } from '@lingui/macro'
import { FeeOptions, toHex } from '@uniswap/v3-sdk'
import { Percent } from '@vanadex/sdk-core'
import { SwapRouter } from '@vanadex/universal-router-sdk'
import { useWeb3React } from '@web3-react/core'
import { getUniversalRouterAddress } from 'constants/universalRouter'
import { useCallback } from 'react'
import { ClassicTrade, TradeFillType } from 'state/routing/types'
import { calculateGasMargin } from 'utils/calculateGasMargin'
import { GasEstimationError, UserRejectedRequestError, WrongChainError } from 'utils/errors'
import isZero from 'utils/isZero'
import { didUserReject, swapErrorToUserReadableMessage } from 'utils/swapErrorToUserReadableMessage'

import { PermitSignature } from './usePermitAllowance'

/**
 * Thrown when the user modifies the transaction in-wallet before submitting it.
 * In-wallet calldata modification nullifies any safeguards (eg slippage) from the interface, so we recommend reverting them immediately.
 */
class ModifiedSwapError extends Error {
  constructor() {
    super(
      t`Your swap was modified through your wallet. If this was a mistake, please cancel immediately or risk losing your funds.`
    )
  }
}

interface SwapOptions {
  slippageTolerance: Percent
  deadline?: BigNumber
  permit?: PermitSignature
  feeOptions?: FeeOptions
}

export function useUniversalRouterSwapCallback(trade: ClassicTrade | undefined, options: SwapOptions) {
  const { account, chainId, provider } = useWeb3React()

  return useCallback(async () => {
    try {
      if (!account) throw new Error('missing account')
      if (!chainId) throw new Error('missing chainId')
      if (!provider) throw new Error('missing provider')
      if (!trade) throw new Error('missing trade')
      const connectedChainId = await provider.getSigner().getChainId()
      if (chainId !== connectedChainId) throw new WrongChainError()

      // universal-router-sdk reconstructs V2Trade objects, so rather than updating the trade amounts to account for tax, we adjust the slippage tolerance as a workaround
      // TODO(WEB-2725): update universal-router-sdk to not reconstruct trades
      const taxAdjustedSlippageTolerance = options.slippageTolerance.add(trade.totalTaxRate)
      const classicTrade = trade as any
      const { calldata: data, value } = SwapRouter.swapERC20CallParameters(classicTrade, {
        slippageTolerance: taxAdjustedSlippageTolerance,
        deadlineOrPreviousBlockhash: options.deadline?.toString(),
        inputTokenPermit: options.permit,
        fee: options.feeOptions,
      })
      const universalRouterAddress = getUniversalRouterAddress(chainId)
      if (!universalRouterAddress) throw new Error('missing universal router address')

      const tx = {
        from: account,
        to: universalRouterAddress,
        data,
        // TODO(https://github.com/vanadex/universal-router-sdk/issues/113): universal-router-sdk returns a non-hexlified value.
        ...(value && !isZero(value) ? { value: toHex(value) } : {}),
      }

      let gasEstimate: BigNumber
      try {
        gasEstimate = await provider.estimateGas(tx)
      } catch (gasError) {
        console.warn(gasError)
        throw new GasEstimationError(gasError)
      }
      const gasLimit = calculateGasMargin(gasEstimate)
      const response = await provider
        .getSigner()
        .sendTransaction({ ...tx, gasLimit })
        .then((response) => {
          if (tx.data !== response.data) {
            if (!response.data || response.data.length === 0 || response.data === '0x') {
              throw new ModifiedSwapError()
            }
          }
          return response
        })
      return {
        type: TradeFillType.Classic as const,
        response,
      }
    } catch (swapError: unknown) {
      if (swapError instanceof ModifiedSwapError) throw swapError

      // Cancellations are not failures, and must be accounted for as 'cancelled'.
      if (didUserReject(swapError)) {
        // This error type allows us to distinguish between user rejections and other errors later too.
        throw new UserRejectedRequestError(swapErrorToUserReadableMessage(swapError, chainId))
      }

      throw new Error(swapErrorToUserReadableMessage(swapError, chainId))
    }
  }, [
    account,
    chainId,
    options.deadline,
    options.feeOptions,
    options.permit,
    options.slippageTolerance,
    provider,
    trade,
  ])
}
