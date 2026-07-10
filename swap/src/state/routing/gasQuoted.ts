import { type Currency, CurrencyAmount } from '@vanadex/sdk-core'
import { ChainId } from '@vanadex/sdk-core'
import { nativeOnChain } from 'constants/tokens'
import JSBI from 'jsbi'

/**
 * Gas cost quoted by the router in wrapped native ({@link nativeOnChain}.wrapped wei).
 * Adds an approval step estimate (USD) proportional to swap gas when both USD estimates exist.
 */
export function buildTotalGasQuotedNative(params: {
  gasUseEstimateQuoteRaw?: string
  chainId?: ChainId
  gasUseEstimateUSD?: number
  approveGasEstimateUSD?: number
}): CurrencyAmount<Currency> | undefined {
  const { gasUseEstimateQuoteRaw, chainId, gasUseEstimateUSD, approveGasEstimateUSD } = params
  if (!gasUseEstimateQuoteRaw || !chainId || gasUseEstimateQuoteRaw === '0') return undefined

  const wrapped = nativeOnChain(chainId).wrapped
  let swapGas: CurrencyAmount<Currency>
  try {
    swapGas = CurrencyAmount.fromRawAmount(wrapped, JSBI.BigInt(gasUseEstimateQuoteRaw))
  } catch {
    return undefined
  }

  const approveUsd = approveGasEstimateUSD ?? 0
  const swapUsd = gasUseEstimateUSD ?? 0
  if (!approveUsd || !swapUsd) return swapGas

  const SCALE = 1e9
  const approveScaled = JSBI.BigInt(Math.max(1, Math.round(approveUsd * SCALE)))
  const swapScaled = JSBI.BigInt(Math.max(1, Math.round(swapUsd * SCALE)))
  const approveQuotient = JSBI.divide(JSBI.multiply(swapGas.quotient, approveScaled), swapScaled)
  const approveGas = CurrencyAmount.fromRawAmount(wrapped, approveQuotient)

  try {
    return swapGas.add(approveGas)
  } catch {
    return swapGas
  }
}
