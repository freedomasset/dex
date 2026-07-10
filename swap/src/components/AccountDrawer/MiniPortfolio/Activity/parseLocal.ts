import { BigNumber } from '@ethersproject/bignumber'
import { t } from '@lingui/macro'
import { ChainId, Currency, CurrencyAmount, Token, TradeType } from '@vanadex/sdk-core'
import { NATIVE_CHAIN_ID, nativeOnChain } from 'constants/tokens'
import { ChainTokenMap, useAllTokensMultichain } from 'hooks/Tokens'
import { useMemo } from 'react'
import { useMultichainTransactions } from 'state/transactions/hooks'
import {
  AddLiquidityV2PoolTransactionInfo,
  AddLiquidityV3PoolTransactionInfo,
  ApproveTransactionInfo,
  CollectFeesTransactionInfo,
  CreateV3PoolTransactionInfo,
  ExactInputSwapTransactionInfo,
  ExactOutputSwapTransactionInfo,
  MigrateV2LiquidityToV3TransactionInfo,
  RemoveLiquidityV3TransactionInfo,
  TransactionDetails,
  TransactionType,
  WrapTransactionInfo,
} from 'state/transactions/types'
import { TransactionStatus } from 'types/types-and-hooks'
import { isAddress } from 'utils'
import { NumberType, useFormatter } from 'utils/formatNumbers'

import { CancelledTransactionTitleTable, getActivityTitle } from '../constants'
import { Activity, ActivityMap } from './types'

type FormatNumberFunctionType = ReturnType<typeof useFormatter>['formatNumber']

function getCurrency(currencyId: string, chainId: ChainId, tokens: ChainTokenMap): Currency | undefined {
  const native = nativeOnChain(chainId)
  const isNativeId = currencyId === 'VANA' || currencyId === native.symbol || currencyId === NATIVE_CHAIN_ID
  if (isNativeId) return native

  const chainTokens = tokens[chainId]
  if (!chainTokens) return undefined

  const direct = chainTokens[currencyId]
  if (direct) return direct

  // 交易里存的地址与列表里 Token 的 EIP-55 大小写不一致时，直接下标会 miss，导致 toast/活动里显示「未知」
  const checksummed = isAddress(currencyId)
  if (checksummed && chainTokens[checksummed]) return chainTokens[checksummed]

  const lower = currencyId.toLowerCase()
  for (const addr of Object.keys(chainTokens)) {
    if (addr.toLowerCase() === lower) return chainTokens[addr]
  }
  return undefined
}

/** 当 token 列表尚未就绪或与交易里地址不一致时，用提交时快照构造 Token，避免通知里显示「未知」 */
function tokenFromTxSnapshot(
  currencyId: string,
  chainId: ChainId,
  symbol: string | undefined,
  decimals: number | undefined
): Token | undefined {
  if (symbol === undefined || decimals === undefined) return undefined
  const addr = isAddress(currencyId)
  if (!addr) return undefined
  return new Token(chainId, addr, decimals, symbol)
}

function resolveSwapCurrency(
  currencyId: string,
  chainId: ChainId,
  tokens: ChainTokenMap,
  symbol: string | undefined,
  decimals: number | undefined
): Currency | undefined {
  return getCurrency(currencyId, chainId, tokens) ?? tokenFromTxSnapshot(currencyId, chainId, symbol, decimals)
}

function resolveLpCurrency(
  currencyId: string,
  chainId: ChainId,
  tokens: ChainTokenMap,
  symbol?: string,
  decimals?: number
): Currency | undefined {
  return getCurrency(currencyId, chainId, tokens) ?? tokenFromTxSnapshot(currencyId, chainId, symbol, decimals)
}

function formatLpLeg(
  currency: Currency | undefined,
  raw: string,
  formatNumber: FormatNumberFunctionType
): string | undefined {
  if (!currency || !raw || BigNumber.from(raw).isZero()) return undefined
  const formatted = formatNumber({
    input: parseFloat(CurrencyAmount.fromRawAmount(currency, raw).toSignificant()),
    type: NumberType.TokenNonTx,
  })
  const symbol = currency.symbol ?? ''
  return [formatted, symbol].filter(Boolean).join(' ')
}

function buildLpDescriptor(
  baseCurrency: Currency | undefined,
  baseRaw: string,
  quoteCurrency: Currency | undefined,
  quoteRaw: string,
  formatNumber: FormatNumberFunctionType
) {
  const legs = [
    formatLpLeg(baseCurrency, baseRaw, formatNumber),
    formatLpLeg(quoteCurrency, quoteRaw, formatNumber),
  ].filter(Boolean)
  if (legs.length > 0) return legs.join(` ${t`and`} `)
  return buildCurrencyDescriptor(baseCurrency, baseRaw, quoteCurrency, quoteRaw, formatNumber, t`and`)
}

function buildCurrencyDescriptor(
  currencyA: Currency | undefined,
  amtA: string,
  currencyB: Currency | undefined,
  amtB: string,
  formatNumber: FormatNumberFunctionType,
  delimiter = t`for`
) {
  const formattedA = currencyA
    ? formatNumber({
        input: parseFloat(CurrencyAmount.fromRawAmount(currencyA, amtA).toSignificant()),
        type: NumberType.TokenNonTx,
      })
    : t`Unknown`
  const symbolA = currencyA?.symbol ?? ''
  const formattedB = currencyB
    ? formatNumber({
        input: parseFloat(CurrencyAmount.fromRawAmount(currencyB, amtB).toSignificant()),
        type: NumberType.TokenNonTx,
      })
    : t`Unknown`
  const symbolB = currencyB?.symbol ?? ''
  return [formattedA, symbolA, delimiter, formattedB, symbolB].filter(Boolean).join(' ')
}

function parseSwap(
  swap: ExactInputSwapTransactionInfo | ExactOutputSwapTransactionInfo,
  chainId: ChainId,
  tokens: ChainTokenMap,
  formatNumber: FormatNumberFunctionType
): Partial<Activity> {
  const tokenIn = resolveSwapCurrency(
    swap.inputCurrencyId,
    chainId,
    tokens,
    swap.inputCurrencySymbol,
    swap.inputCurrencyDecimals
  )
  const tokenOut = resolveSwapCurrency(
    swap.outputCurrencyId,
    chainId,
    tokens,
    swap.outputCurrencySymbol,
    swap.outputCurrencyDecimals
  )
  const [inputRaw, outputRaw] =
    swap.tradeType === TradeType.EXACT_INPUT
      ? [swap.inputCurrencyAmountRaw, swap.settledOutputCurrencyAmountRaw ?? swap.expectedOutputCurrencyAmountRaw]
      : [swap.expectedInputCurrencyAmountRaw, swap.outputCurrencyAmountRaw]

  return {
    descriptor: buildCurrencyDescriptor(tokenIn, inputRaw, tokenOut, outputRaw, formatNumber, undefined),
    currencies: [tokenIn, tokenOut],
    prefixIconSrc: undefined,
  }
}

function parseWrap(
  wrap: WrapTransactionInfo,
  chainId: ChainId,
  status: TransactionStatus,
  formatNumber: FormatNumberFunctionType
): Partial<Activity> {
  const native = nativeOnChain(chainId)
  const wrapped = native.wrapped
  const [input, output] = wrap.unwrapped ? [wrapped, native] : [native, wrapped]

  const descriptor = buildCurrencyDescriptor(
    input,
    wrap.currencyAmountRaw,
    output,
    wrap.currencyAmountRaw,
    formatNumber
  )
  const title = getActivityTitle(TransactionType.WRAP, status, wrap.unwrapped)
  const currencies = wrap.unwrapped ? [wrapped, native] : [native, wrapped]

  return { title, descriptor, currencies }
}

function parseApproval(
  approval: ApproveTransactionInfo,
  chainId: ChainId,
  tokens: ChainTokenMap,
  status: TransactionStatus
): Partial<Activity> {
  const currency =
    getCurrency(approval.tokenAddress, chainId, tokens) ??
    tokenFromTxSnapshot(approval.tokenAddress, chainId, approval.tokenSymbol, approval.tokenDecimals)
  const descriptor = currency?.symbol ?? currency?.name ?? (approval.tokenSymbol ? approval.tokenSymbol : t`Unknown`)
  return {
    title: getActivityTitle(
      TransactionType.APPROVAL,
      status,
      BigNumber.from(approval.amount).eq(0) /* use alternate if it's a revoke */
    ),
    descriptor,
    currencies: [currency],
  }
}

type GenericLPInfo = Omit<
  AddLiquidityV3PoolTransactionInfo | RemoveLiquidityV3TransactionInfo | AddLiquidityV2PoolTransactionInfo,
  'type'
>
function parseLP(
  lp: GenericLPInfo,
  chainId: ChainId,
  tokens: ChainTokenMap,
  formatNumber: FormatNumberFunctionType
): Partial<Activity> {
  const baseCurrency = resolveLpCurrency(
    lp.baseCurrencyId,
    chainId,
    tokens,
    lp.baseCurrencySymbol,
    lp.baseCurrencyDecimals
  )
  const quoteCurrency = resolveLpCurrency(
    lp.quoteCurrencyId,
    chainId,
    tokens,
    lp.quoteCurrencySymbol,
    lp.quoteCurrencyDecimals
  )
  const [baseRaw, quoteRaw] = [lp.expectedAmountBaseRaw, lp.expectedAmountQuoteRaw]
  const descriptor = buildLpDescriptor(baseCurrency, baseRaw, quoteCurrency, quoteRaw, formatNumber)

  return { descriptor, currencies: [baseCurrency, quoteCurrency] }
}

function parseCollectFees(
  collect: CollectFeesTransactionInfo,
  chainId: ChainId,
  tokens: ChainTokenMap,
  formatNumber: FormatNumberFunctionType
): Partial<Activity> {
  // Adapts CollectFeesTransactionInfo to generic LP type
  const {
    currencyId0: baseCurrencyId,
    currencyId1: quoteCurrencyId,
    expectedCurrencyOwed0: expectedAmountBaseRaw,
    expectedCurrencyOwed1: expectedAmountQuoteRaw,
  } = collect
  return parseLP(
    { baseCurrencyId, quoteCurrencyId, expectedAmountBaseRaw, expectedAmountQuoteRaw },
    chainId,
    tokens,
    formatNumber
  )
}

function parseMigrateCreateV3(
  lp: MigrateV2LiquidityToV3TransactionInfo | CreateV3PoolTransactionInfo,
  chainId: ChainId,
  tokens: ChainTokenMap
): Partial<Activity> {
  const baseCurrency = getCurrency(lp.baseCurrencyId, chainId, tokens)
  const baseSymbol = baseCurrency?.symbol ?? t`Unknown`
  const quoteCurrency = getCurrency(lp.quoteCurrencyId, chainId, tokens)
  const quoteSymbol = quoteCurrency?.symbol ?? t`Unknown`
  const descriptor = t`${baseSymbol} and ${quoteSymbol}`

  return { descriptor, currencies: [baseCurrency, quoteCurrency] }
}

export function getTransactionStatus(details: TransactionDetails): TransactionStatus {
  return !details.receipt
    ? TransactionStatus.Pending
    : details.receipt.status === 1 || details.receipt?.status === undefined
    ? TransactionStatus.Confirmed
    : TransactionStatus.Failed
}

export function transactionToActivity(
  details: TransactionDetails,
  chainId: ChainId,
  tokens: ChainTokenMap,
  formatNumber: FormatNumberFunctionType
): Activity | undefined {
  try {
    const status = getTransactionStatus(details)

    const defaultFields = {
      hash: details.hash,
      chainId,
      title: getActivityTitle(details.info.type, status),
      status,
      timestamp: (details.confirmedTime ?? details.addedTime) / 1000,
      from: details.from,
      nonce: details.nonce,
      cancelled: details.cancelled,
    }

    let additionalFields: Partial<Activity> = {}
    const info = details.info
    if (info.type === TransactionType.SWAP) {
      additionalFields = parseSwap(info, chainId, tokens, formatNumber)
    } else if (info.type === TransactionType.APPROVAL) {
      additionalFields = parseApproval(info, chainId, tokens, status)
    } else if (info.type === TransactionType.WRAP) {
      additionalFields = parseWrap(info, chainId, status, formatNumber)
    } else if (
      info.type === TransactionType.ADD_LIQUIDITY_V3_POOL ||
      info.type === TransactionType.REMOVE_LIQUIDITY_V3 ||
      info.type === TransactionType.ADD_LIQUIDITY_V2_POOL
    ) {
      additionalFields = parseLP(info, chainId, tokens, formatNumber)
    } else if (info.type === TransactionType.COLLECT_FEES) {
      additionalFields = parseCollectFees(info, chainId, tokens, formatNumber)
    } else if (info.type === TransactionType.MIGRATE_LIQUIDITY_V3 || info.type === TransactionType.CREATE_V3_POOL) {
      additionalFields = parseMigrateCreateV3(info, chainId, tokens)
    }

    const activity = { ...defaultFields, ...additionalFields }

    if (details.cancelled) {
      activity.title = CancelledTransactionTitleTable[details.info.type]
      activity.status = TransactionStatus.Confirmed
    }

    return activity
  } catch (error) {
    console.debug(`Failed to parse transaction ${details.hash}`, error)
    return undefined
  }
}

export function useLocalActivities(account: string): ActivityMap {
  const allTransactions = useMultichainTransactions()
  const tokens = useAllTokensMultichain()
  const { formatNumber } = useFormatter()

  return useMemo(() => {
    const activityMap: ActivityMap = {}
    for (const [transaction, chainId] of allTransactions) {
      if (transaction.from !== account) continue

      const activity = transactionToActivity(transaction, chainId, tokens, formatNumber)
      if (activity) activityMap[transaction.hash] = activity
    }

    return activityMap
  }, [account, allTransactions, formatNumber, tokens])
}
