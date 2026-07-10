import { skipToken } from '@reduxjs/toolkit/query/react'
import { Currency, CurrencyAmount, TradeType } from '@vanadex/sdk-core'
import { useWeb3React } from '@web3-react/core'
import { AVERAGE_L1_BLOCK_TIME } from 'constants/chainInfo'
import { ZERO_PERCENT } from 'constants/misc'
import { useRoutingAPIArguments } from 'lib/hooks/routing/useRoutingAPIArguments'
import ms from 'ms'
import { useEffect, useMemo, useRef, useState } from 'react'

import { getRoutingApiQuote } from './slice'
import {
  GetQuoteArgs,
  INTERNAL_ROUTER_PREFERENCE_PRICE,
  QuoteMethod,
  QuoteState,
  RouterPreference,
  SubmittableTrade,
  TradeState,
} from './types'

const TRADE_LOADING = { state: TradeState.LOADING, trade: undefined, currentData: undefined } as const
//export const TRADE_NOT_FOUND = { state: TradeState.NO_ROUTE_FOUND, trade: undefined, currentData: undefined } as const

type RoutingAPITradeReturn = {
  state: TradeState
  trade?: SubmittableTrade
  currentTrade?: SubmittableTrade
  method?: QuoteMethod
  swapQuoteLatency?: number
}

/**
 * Returns the best trade by invoking the routing api or the smart order router on the client
 * @param tradeType whether the swap is an exact in/out
 * @param amountSpecified the exact amount to swap in/out
 * @param otherCurrency the desired output/payment currency
 */
export function useRoutingAPITrade<TTradeType extends TradeType>(
  skipFetch: boolean,
  tradeType: TTradeType,
  amountSpecified: CurrencyAmount<Currency> | undefined,
  otherCurrency: Currency | undefined,
  routerPreference: RouterPreference | typeof INTERNAL_ROUTER_PREFERENCE_PRICE,
  account?: string,
  inputTax = ZERO_PERCENT,
  outputTax = ZERO_PERCENT
): RoutingAPITradeReturn {
  const [currencyIn, currencyOut]: [Currency | undefined, Currency | undefined] = useMemo(
    () =>
      tradeType === TradeType.EXACT_INPUT
        ? [amountSpecified?.currency, otherCurrency]
        : [otherCurrency, amountSpecified?.currency],
    [amountSpecified, otherCurrency, tradeType]
  )
  const [result, setResult] = useState<RoutingAPITradeReturn>({ state: TradeState.INVALID })
  const timerIdRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const { provider } = useWeb3React()
  const queryArgs = useRoutingAPIArguments({
    account,
    tokenIn: currencyIn,
    tokenOut: currencyOut,
    amount: amountSpecified,
    tradeType,
    routerPreference,
    inputTax,
    outputTax,
  })
  useEffect(() => {
    const args = queryArgs
    if (skipFetch) return
    if (args === skipToken) return setResult({ state: TradeState.INVALID, trade: undefined, currentTrade: undefined })
    async function updateResults(args: GetQuoteArgs) {
      if (document.hidden) return
      const walletProvider = provider
      const makePriceQuery = async () => {
        const {
          isError,
          data: tradeResult,
          error,
          currentData,
        } = await getRoutingApiQuote(
          args,
          walletProvider,
          args.routerPreference === INTERNAL_ROUTER_PREFERENCE_PRICE ? ms(`1m`) : AVERAGE_L1_BLOCK_TIME
        )
        if (!args.amount || isError) {
          return {
            state: TradeState.INVALID,
            trade: undefined,
            currentTrade: currentData?.trade,
            error: JSON.stringify(error),
          }
        } else if (tradeResult?.state?.state === QuoteState.NOT_FOUND) {
          return {
            state: TradeState.NO_ROUTE_FOUND,
            trade: undefined,
            currentTrade: currentData?.trade,
          }
        } else if (!tradeResult?.trade) {
          return TRADE_LOADING
        } else {
          return {
            state: TradeState.VALID,
            trade: tradeResult?.trade,
            currentTrade: currentData?.trade,
          }
        }
      }
      const res = await makePriceQuery()
      if (!active) return
      setResult(res)
    }
    let active = true
    setResult(TRADE_LOADING)
    updateResults(args)
    timerIdRef.current = setInterval(() => {
      // trigger price update peridiocally but don't trigger one if the tab is not active
      if ('visibilityState' in document && document.visibilityState === 'hidden') return
      updateResults(args)
    }, AVERAGE_L1_BLOCK_TIME)
    return () => {
      active = false
      if (timerIdRef.current) clearInterval(timerIdRef.current)
    }
  }, [queryArgs, provider, skipFetch])
  return result
}
