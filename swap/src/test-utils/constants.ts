// This is a test file, so the import of smart-order-router is allowed.
// eslint-disable-next-line @typescript-eslint/no-restricted-imports
import { FeeAmount, Pool } from '@uniswap/v3-sdk'
import { CurrencyAmount, Percent, Token, TradeType } from '@vanadex/sdk-core'
// eslint-disable-next-line @typescript-eslint/no-restricted-imports
import { V3Route } from '@vanadex/smart-order-router'
import { ZERO_PERCENT } from 'constants/misc'
import JSBI from 'jsbi'
import { ClassicTrade, PreviewTrade, QuoteMethod } from 'state/routing/types'

export const TEST_TOKEN_1 = new Token(1, '0x0000000000000000000000000000000000000001', 18, 'ABC', 'Abc')
export const TEST_TOKEN_2 = new Token(1, '0x0000000000000000000000000000000000000002', 18, 'DEF', 'Def')
export const TEST_TOKEN_3 = new Token(1, '0x0000000000000000000000000000000000000003', 18, 'GHI', 'Ghi')
export const TEST_RECIPIENT_ADDRESS = '0x0000000000000000000000000000000000000004'

export const TEST_POOL_12 = new Pool(
  TEST_TOKEN_1,
  TEST_TOKEN_2,
  FeeAmount.HIGH,
  '2437312313659959819381354528',
  '10272714736694327408',
  -69633
)

export const TEST_POOL_13 = new Pool(
  TEST_TOKEN_1,
  TEST_TOKEN_3,
  FeeAmount.MEDIUM,
  '2437312313659959819381354528',
  '10272714736694327408',
  -69633
)

export const toCurrencyAmount = (token: Token, amount: number) =>
  CurrencyAmount.fromRawAmount(token, JSBI.BigInt(amount))

export const TEST_TRADE_EXACT_INPUT = new ClassicTrade({
  v3Routes: [
    {
      routev3: new V3Route([TEST_POOL_12], TEST_TOKEN_1, TEST_TOKEN_2),
      inputAmount: toCurrencyAmount(TEST_TOKEN_1, 1000),
      outputAmount: toCurrencyAmount(TEST_TOKEN_2, 1000),
    },
  ],
  v2Routes: [],
  tradeType: TradeType.EXACT_INPUT,
  gasUseEstimateUSD: 1.0,
  approveInfo: { needsApprove: false },
  quoteMethod: QuoteMethod.CLIENT_SIDE,
  inputTax: ZERO_PERCENT,
  outputTax: ZERO_PERCENT,
})

export const TEST_TRADE_EXACT_INPUT_API = new ClassicTrade({
  v3Routes: [
    {
      routev3: new V3Route([TEST_POOL_12], TEST_TOKEN_1, TEST_TOKEN_2),
      inputAmount: toCurrencyAmount(TEST_TOKEN_1, 1000),
      outputAmount: toCurrencyAmount(TEST_TOKEN_2, 1000),
    },
  ],
  v2Routes: [],
  tradeType: TradeType.EXACT_INPUT,
  gasUseEstimateUSD: 1.0,
  approveInfo: { needsApprove: false },
  quoteMethod: QuoteMethod.ROUTING_API,
  inputTax: ZERO_PERCENT,
  outputTax: ZERO_PERCENT,
})

export const TEST_TRADE_EXACT_OUTPUT = new ClassicTrade({
  v3Routes: [
    {
      routev3: new V3Route([TEST_POOL_13], TEST_TOKEN_1, TEST_TOKEN_3),
      inputAmount: toCurrencyAmount(TEST_TOKEN_1, 1000),
      outputAmount: toCurrencyAmount(TEST_TOKEN_3, 1000),
    },
  ],
  v2Routes: [],
  tradeType: TradeType.EXACT_OUTPUT,
  quoteMethod: QuoteMethod.CLIENT_SIDE,
  approveInfo: { needsApprove: false },
  inputTax: ZERO_PERCENT,
  outputTax: ZERO_PERCENT,
})

export const TEST_ALLOWED_SLIPPAGE = new Percent(2, 100)

export const TEST_TRADE_FEE_ON_SELL = new ClassicTrade({
  v3Routes: [
    {
      routev3: new V3Route([TEST_POOL_12], TEST_TOKEN_1, TEST_TOKEN_2),
      inputAmount: toCurrencyAmount(TEST_TOKEN_1, 1000),
      outputAmount: toCurrencyAmount(TEST_TOKEN_2, 1000),
    },
  ],
  v2Routes: [],
  tradeType: TradeType.EXACT_INPUT,
  gasUseEstimateUSD: 1.0,
  approveInfo: { needsApprove: false },
  quoteMethod: QuoteMethod.ROUTING_API,
  inputTax: new Percent(3, 100),
  outputTax: ZERO_PERCENT,
})

export const TEST_TRADE_FEE_ON_BUY = new ClassicTrade({
  v3Routes: [
    {
      routev3: new V3Route([TEST_POOL_12], TEST_TOKEN_1, TEST_TOKEN_2),
      inputAmount: toCurrencyAmount(TEST_TOKEN_1, 1000),
      outputAmount: toCurrencyAmount(TEST_TOKEN_2, 1000),
    },
  ],
  v2Routes: [],
  tradeType: TradeType.EXACT_INPUT,
  gasUseEstimateUSD: 1.0,
  approveInfo: { needsApprove: false },
  quoteMethod: QuoteMethod.ROUTING_API,
  inputTax: ZERO_PERCENT,
  outputTax: new Percent(3, 100),
})

export const PREVIEW_EXACT_IN_TRADE = new PreviewTrade({
  inputAmount: toCurrencyAmount(TEST_TOKEN_1, 1000),
  outputAmount: toCurrencyAmount(TEST_TOKEN_2, 1000),
  tradeType: TradeType.EXACT_INPUT,
  inputTax: new Percent(0, 100),
  outputTax: new Percent(0, 100),
})
