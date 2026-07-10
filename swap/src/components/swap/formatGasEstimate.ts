import type { Currency, CurrencyAmount } from '@vanadex/sdk-core'
import { NumberType } from 'utils/formatNumbers'

/** Matches prior fiat gas UI (`<0.01 …`) using the chain native symbol (gas is ultimately paid on-chain in native). */
export function formatNetworkGasEstimateLabel(params: {
  amount: CurrencyAmount<Currency>
  nativeSymbol: string
  formatCurrencyAmount: (opts: { amount: CurrencyAmount<Currency>; type: NumberType }) => string
}): string {
  const { amount, nativeSymbol, formatCurrencyAmount } = params
  const formatted = formatCurrencyAmount({ amount, type: NumberType.TokenNonTx })
  const exact = Number.parseFloat(amount.toExact())

  if (!Number.isFinite(exact) || exact <= 0) {
    return `<0.01 ${nativeSymbol}`
  }

  return exact < 0.01 ? `<0.01 ${nativeSymbol}` : `${formatted} ${nativeSymbol}`
}
