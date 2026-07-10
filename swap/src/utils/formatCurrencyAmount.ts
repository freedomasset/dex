import { Currency, CurrencyAmount, Fraction } from '@vanadex/sdk-core'
import { DEFAULT_LOCALE, SupportedLocale } from 'constants/locales'
import JSBI from 'jsbi'
import formatLocaleNumber from 'lib/utils/formatLocaleNumber'

const FEE_AMOUNT_MAX_DECIMALS = 8

export function formatCurrencyAmount(
  amount: CurrencyAmount<Currency> | undefined,
  sigFigs: number,
  locale: SupportedLocale = DEFAULT_LOCALE,
  fixedDecimals?: number
): string {
  if (!amount) {
    return '-'
  }

  if (JSBI.equal(amount.quotient, JSBI.BigInt(0))) {
    return '0'
  }

  if (amount.divide(amount.decimalScale).lessThan(new Fraction(1, 100000))) {
    return `<${formatLocaleNumber({ number: 0.00001, locale })}`
  }

  return formatLocaleNumber({ number: amount, locale, sigFigs, fixedDecimals })
}

/** 未领取手续费展示：最多 8 位小数，避免极小金额被显示为 0 */
export function formatFeeCurrencyAmount(
  amount: CurrencyAmount<Currency> | undefined,
  maxDecimals: number = FEE_AMOUNT_MAX_DECIMALS
): string {
  if (!amount) {
    return '-'
  }

  if (JSBI.equal(amount.quotient, JSBI.BigInt(0))) {
    return '0'
  }

  const numeric = parseFloat(amount.toExact())
  const factor = 10 ** maxDecimals
  const truncated = Math.floor(numeric * factor) / factor
  return truncated.toFixed(maxDecimals).replace(/\.?0+$/, '')
}
