import { Gas } from 'components/Icons/Gas'
import { LoadingOpacityContainer } from 'components/Loader/styled'
import Row, { RowFixed } from 'components/Row'
import { MouseoverTooltip, TooltipSize } from 'components/Tooltip'
import { SUPPORTED_GAS_ESTIMATE_CHAIN_IDS } from 'constants/chains'
import { getNativeCurrencySymbol } from 'constants/tokens'
import { SubmittableTrade } from 'state/routing/types'
import styled from 'styled-components'
import { ThemedText } from 'theme/components'
import { NumberType, useFormatter } from 'utils/formatNumbers'

import { formatNetworkGasEstimateLabel } from './formatGasEstimate'
import { GasBreakdownTooltip } from './GasBreakdownTooltip'

const StyledGasIcon = styled(Gas)`
  height: 16px;
  width: 16px;
  // We apply the following to all children of the SVG in order to override the default color
  & > * {
    fill: ${({ theme }) => theme.neutral2};
  }
`

export default function GasEstimateTooltip({ trade, loading }: { trade?: SubmittableTrade; loading: boolean }) {
  const { formatNumber, formatCurrencyAmount } = useFormatter()

  const swapChainId = trade?.inputAmount.currency.chainId
  if (!trade || !swapChainId || !SUPPORTED_GAS_ESTIMATE_CHAIN_IDS.includes(swapChainId)) {
    return null
  }

  const quotedNative = trade.gasUseEstimateQuotedNative
  const gasLabel = quotedNative
    ? formatNetworkGasEstimateLabel({
        amount: quotedNative,
        nativeSymbol: getNativeCurrencySymbol(swapChainId),
        formatCurrencyAmount,
      })
    : formatNumber({
        input: trade.totalGasUseEstimateUSD,
        type: NumberType.FiatGasPrice,
      })

  return (
    <MouseoverTooltip size={TooltipSize.Small} text={<GasBreakdownTooltip trade={trade} />} placement="right">
      <LoadingOpacityContainer $loading={loading}>
        <RowFixed gap="xs">
          <StyledGasIcon />
          <ThemedText.BodySmall color="neutral2">
            <Row gap="xs">
              <div>{gasLabel}</div>
            </Row>
          </ThemedText.BodySmall>
        </RowFixed>
      </LoadingOpacityContainer>
    </MouseoverTooltip>
  )
}
