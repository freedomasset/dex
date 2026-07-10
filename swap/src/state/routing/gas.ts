import type { JsonRpcProvider } from '@ethersproject/providers'
import { MaxUint256, PERMIT2_ADDRESS } from '@uniswap/permit2-sdk'
import { Currency } from '@vanadex/sdk-core'
import ERC20_ABI from 'abis/erc20.json'
import { Erc20 } from 'abis/types'
import { getContract } from 'utils'

import { ApproveInfo } from './types'

const APPROVE_FALLBACK_GAS_LIMIT = 65_000

export async function getApproveInfo(
  account: string | undefined,
  currency: Currency,
  amount: string,
  provider: JsonRpcProvider,
  usdCostPerGas?: number
): Promise<ApproveInfo> {
  // native currencies do not need token approvals
  if (currency.isNative) return { needsApprove: false }

  // If any of these arguments aren't provided, then we cannot generate approval cost info
  if (!account || !usdCostPerGas) return { needsApprove: false }

  const tokenContract = getContract(currency.address, ERC20_ABI, provider) as Erc20

  let approveGasUseEstimate
  try {
    const allowance = await tokenContract.callStatic.allowance(account, PERMIT2_ADDRESS)
    if (!allowance.lt(amount)) return { needsApprove: false }
  } catch (_) {
    // If contract lookup fails (eg if Infura goes down), then don't show gas info for approving the token
    return { needsApprove: false }
  }

  try {
    const approveTx = await tokenContract.populateTransaction.approve(PERMIT2_ADDRESS, MaxUint256)
    approveGasUseEstimate = (await provider.estimateGas({ from: account, ...approveTx })).toNumber()
  } catch (_) {
    // estimateGas will error if the account doesn't have sufficient token balance, but we should show an estimated cost anyway
    approveGasUseEstimate = APPROVE_FALLBACK_GAS_LIMIT
  }

  return { needsApprove: true, approveGasEstimateUSD: approveGasUseEstimate * usdCostPerGas }
}
