import { Currency, CurrencyAmount } from '@vanadex/sdk-core'
import { useMemo } from 'react'

import useStablecoinPrice from './useStablecoinPrice'

export function useUSDPrice(currencyAmount?: CurrencyAmount<Currency>): {
  data?: number
  isLoading: boolean
} {
  // Use USDC-based pricing for chains.
  const stablecoinPrice = useStablecoinPrice(currencyAmount?.currency)

  return useMemo(() => {
    if (currencyAmount && stablecoinPrice) {
      return { data: parseFloat(stablecoinPrice.quote(currencyAmount).toSignificant()), isLoading: false }
    } else {
      return { data: undefined, isLoading: false }
    }
  }, [currencyAmount, stablecoinPrice])
}
