import { Trans } from '@lingui/macro'
import { Currency, CurrencyAmount } from '@vanadex/sdk-core'
import { AutoColumn } from 'components/Column'
import Row from 'components/Row'
import { getNativeCurrencySymbol, nativeOnChain } from 'constants/tokens'
import JSBI from 'jsbi'
import { ReactNode } from 'react'
import type { ClassicTrade, InterfaceTrade } from 'state/routing/types'
import { isClassicTrade, isPreviewTrade } from 'state/routing/utils'
import styled from 'styled-components'
import { Divider, ExternalLink, ThemedText } from 'theme/components'
import { NumberType, useFormatter } from 'utils/formatNumbers'

import { formatNetworkGasEstimateLabel } from './formatGasEstimate'

const Container = styled(AutoColumn)`
  padding: 4px;
`

type GasCostItemProps = { title: ReactNode; itemValue?: React.ReactNode; amount?: number }

const GasCostItem = ({ title, amount, itemValue }: GasCostItemProps) => {
  const { formatNumber } = useFormatter()

  if (!amount && !itemValue) return null

  const value = itemValue ?? formatNumber({ input: amount, type: NumberType.FiatGasPrice })
  return (
    <Row justify="space-between">
      <ThemedText.SubHeaderSmall>{title}</ThemedText.SubHeaderSmall>
      <ThemedText.SubHeaderSmall color="neutral1">{value}</ThemedText.SubHeaderSmall>
    </Row>
  )
}

/** Approve-leg gas quoted in wrapped native using the same USD ratio as `buildTotalGasQuotedNative`. */
function quotedApproveGasNative(classicTrade: ClassicTrade): CurrencyAmount<Currency> | undefined {
  const swapGas = classicTrade.swapGasQuotedNative
  const swapUsd = classicTrade.gasUseEstimateUSD
  if (!(classicTrade.approveInfo.needsApprove === true && swapUsd && swapUsd > 0) || !swapGas) return undefined

  const approveGasEstimateUSD =
    classicTrade.approveInfo.needsApprove === true ? classicTrade.approveInfo.approveGasEstimateUSD : undefined
  if (!approveGasEstimateUSD) return undefined

  const SCALE = 1e9
  const approveScaled = JSBI.BigInt(Math.max(1, Math.round(approveGasEstimateUSD * SCALE)))
  const swapScaled = JSBI.BigInt(Math.max(1, Math.round(swapUsd * SCALE)))
  const quotient = JSBI.divide(JSBI.multiply(swapGas.quotient, approveScaled), swapScaled)

  try {
    return CurrencyAmount.fromRawAmount(swapGas.currency, quotient)
  } catch {
    return undefined
  }
}

function NativeGasLabels({ classicTrade }: { classicTrade: ClassicTrade }) {
  const { formatCurrencyAmount } = useFormatter()
  const chainId = classicTrade.inputAmount.currency.chainId
  const nativeSymbol = getNativeCurrencySymbol(chainId)

  const approveInfo = classicTrade.approveInfo
  const approveGasEstimateUSD = approveInfo.needsApprove === true ? approveInfo.approveGasEstimateUSD : undefined

  const swapQuoted = classicTrade.swapGasQuotedNative
  const approvalQuoted = quotedApproveGasNative(classicTrade)
  const showNative = Boolean(swapQuoted)

  const wrapEstimate = undefined
  let swapDisplay: string | undefined
  if (showNative && swapQuoted) {
    swapDisplay = formatNetworkGasEstimateLabel({
      amount: swapQuoted,
      nativeSymbol,
      formatCurrencyAmount,
    })
  }

  let approvalDisplay: string | undefined
  if (approveGasEstimateUSD !== undefined && showNative && approvalQuoted) {
    approvalDisplay = formatNetworkGasEstimateLabel({
      amount: approvalQuoted,
      nativeSymbol,
      formatCurrencyAmount,
    })
  }

  const approvalUsdAmount =
    approveGasEstimateUSD !== undefined && approveInfo.needsApprove === true && !(showNative && approvalDisplay)
      ? approveGasEstimateUSD
      : undefined

  const swapUsdAmount =
    classicTrade.gasUseEstimateUSD !== undefined && !showNative ? classicTrade.gasUseEstimateUSD : undefined

  return (
    <AutoColumn gap="sm">
      <GasCostItem title={<Trans>Wrap {nativeOnChain(chainId).symbol}</Trans>} amount={wrapEstimate} />
      <GasCostItem
        title={<Trans>Allow {classicTrade.inputAmount.currency.symbol} (one time)</Trans>}
        amount={approvalUsdAmount}
        itemValue={approvalDisplay}
      />
      <GasCostItem title={<Trans>Swap</Trans>} amount={swapUsdAmount} itemValue={swapDisplay} />
    </AutoColumn>
  )
}

type GasBreakdownTooltipProps = { trade: InterfaceTrade }

export function GasBreakdownTooltip({ trade }: GasBreakdownTooltipProps) {
  const inputCurrency = trade.inputAmount.currency
  const native = nativeOnChain(inputCurrency.chainId)

  if (isPreviewTrade(trade)) return <NetworkFeesDescription native={native} />

  if (!isClassicTrade(trade)) return <NetworkFeesDescription native={native} />

  const classicTrade = trade

  const description = <NetworkFeesDescription native={native} />

  const hasBreakdownLines =
    classicTrade.approveInfo.needsApprove || classicTrade.swapGasQuotedNative || classicTrade.gasUseEstimateUSD

  if (!hasBreakdownLines) return description

  return (
    <Container gap="md">
      <NativeGasLabels classicTrade={classicTrade} />
      <Divider />
      {description}
    </Container>
  )
}

function NetworkFeesDescription({ native }: { native: Currency }) {
  return (
    <ThemedText.LabelMicro>
      <Trans>
        The fee paid to the Ethereum network to process your transaction. This must be paid in {native.symbol}.
      </Trans>{' '}
      <ExternalLink href="https://support.uniswap.org/hc/en-us/articles/8370337377805-What-is-a-network-fee-">
        <Trans>Learn more</Trans>
      </ExternalLink>
    </ThemedText.LabelMicro>
  )
}
