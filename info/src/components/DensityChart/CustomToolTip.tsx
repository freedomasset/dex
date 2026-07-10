import React from 'react'
import { PoolData } from 'state/pools/reducer'
import styled from 'styled-components'
import { LightCard } from 'components/Card'
import useTheme from 'hooks/useTheme'
import { AutoColumn } from 'components/Column'
import { TYPE } from 'theme'
import { RowBetween } from 'components/Row'
import { formatTokenAmount } from 'utils/numbers'
import { useTranslation } from 'react-i18next'

const TooltipWrapper = styled(LightCard)`
  padding: 12px;
  width: 320px;
  opacity: 0.8;
  font-size: 12px;
  z-index: 10;
`

interface CustomToolTipProps {
  chartProps: any
  poolData: PoolData
  currentPrice: number | undefined
}

export function CustomToolTip({ chartProps, poolData, currentPrice }: CustomToolTipProps) {
  const theme = useTheme()
  const { t } = useTranslation()
  const price0 = chartProps?.payload?.[0]?.payload.price0
  const price1 = chartProps?.payload?.[0]?.payload.price1
  const tvlToken0 = chartProps?.payload?.[0]?.payload.tvlToken0
  const tvlToken1 = chartProps?.payload?.[0]?.payload.tvlToken1

  return (
    <TooltipWrapper>
      <AutoColumn $gap="sm">
        <TYPE.main color={'#eee'}>{t('tickStats')}</TYPE.main>
        <RowBetween>
          <TYPE.label>{poolData?.token0?.symbol} {t('priceLabel')} </TYPE.label>
          <TYPE.label>
            {price0
              ? Number(price0).toLocaleString(undefined, {
                  minimumSignificantDigits: 1,
                })
              : ''}{' '}
            {poolData?.token1?.symbol}
          </TYPE.label>
        </RowBetween>
        <RowBetween>
          <TYPE.label>{poolData?.token1?.symbol} {t('priceLabel')} </TYPE.label>
          <TYPE.label>
            {price1
              ? Number(price1).toLocaleString(undefined, {
                  minimumSignificantDigits: 1,
                })
              : ''}{' '}
            {poolData?.token0?.symbol}
          </TYPE.label>
        </RowBetween>
        {currentPrice && price0 && currentPrice > price1 ? (
          <RowBetween>
            <TYPE.label>{poolData?.token0?.symbol} {t('lockedLabel')} </TYPE.label>
            <TYPE.label>
              {tvlToken0 ? formatTokenAmount(tvlToken0) : ''} {poolData?.token0?.symbol}
            </TYPE.label>
          </RowBetween>
        ) : (
          <RowBetween>
            <TYPE.label>{poolData?.token1?.symbol} {t('lockedLabel')} </TYPE.label>
            <TYPE.label>
              {tvlToken1 ? formatTokenAmount(tvlToken1) : ''} {poolData?.token1?.symbol}
            </TYPE.label>
          </RowBetween>
        )}
      </AutoColumn>
    </TooltipWrapper>
  )
}

export default CustomToolTip
