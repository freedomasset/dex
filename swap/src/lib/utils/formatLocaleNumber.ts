import { Currency, CurrencyAmount, Price } from '@vanadex/sdk-core'
import { DEFAULT_LOCALE, SUPPORTED_LOCALES } from 'constants/locales'

interface FormatLocaleNumberArgs {
  number: CurrencyAmount<Currency> | Price<Currency, Currency> | number
  locale?: string | null
  options?: Intl.NumberFormatOptions
  sigFigs?: number
  fixedDecimals?: number
}

export default function formatLocaleNumber({
  number,
  locale,
  sigFigs,
  fixedDecimals,
  options = {},
}: FormatLocaleNumberArgs): string {
  let localeArg: string | string[]
  if (!locale || (locale && !SUPPORTED_LOCALES.includes(locale))) {
    localeArg = DEFAULT_LOCALE
  } else {
    localeArg = [locale, DEFAULT_LOCALE]
  }
  options.minimumFractionDigits = options.minimumFractionDigits || fixedDecimals
  options.maximumFractionDigits = options.maximumFractionDigits || fixedDecimals

  // Fixed decimals should override significant figures.
  options.maximumSignificantDigits = options.maximumSignificantDigits || fixedDecimals ? undefined : sigFigs

  let numberString: number
  if (typeof number === 'number') {
    numberString = fixedDecimals ? parseFloat(number.toFixed(fixedDecimals)) : number
  } else {
    // For CurrencyAmount/Price, first get the full numeric value with high precision
    // to determine if it's a large number, then format accordingly
    const fullNumericValue = parseFloat(number.toSignificant(18))

    if (fixedDecimals !== undefined) {
      // If fixedDecimals is specified, use it
      numberString = parseFloat(fullNumericValue.toFixed(fixedDecimals))
    } else if (fullNumericValue >= 1) {
      // For large numbers (>= 1), use 2 decimal places with truncation (no rounding)
      // Multiply by 100, floor to truncate, then divide by 100
      numberString = Math.floor(fullNumericValue * 100) / 100
      // Update options to reflect fixed 2 decimals
      options.minimumFractionDigits = 2
      options.maximumFractionDigits = 2
      options.maximumSignificantDigits = undefined
    } else {
      // For small numbers (< 1), use significant figures for better precision
      numberString = parseFloat(number.toSignificant(sigFigs))
    }
  }

  return numberString.toLocaleString(localeArg, options)
}
