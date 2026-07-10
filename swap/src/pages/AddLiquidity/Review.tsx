import { Trans } from '@lingui/macro'
import { Position } from '@uniswap/v3-sdk'
import { Currency, CurrencyAmount } from '@vanadex/sdk-core'
import { AutoColumn } from 'components/Column'
import { getPriceOrderingFromPositionForUI } from 'components/PositionListItem'
import { PositionPreview } from 'components/PositionPreview'
import { useMemo } from 'react'
import styled from 'styled-components'
import { unwrappedToken } from 'utils/unwrappedToken'

import { Bound, Field } from '../../state/mint/v3/actions'

const Wrapper = styled.div`
  padding-top: 12px;
`

function depositAmountForToken(
  parsedAmounts: { [field in Field]?: CurrencyAmount<Currency> },
  currencies: { [field in Field]?: Currency },
  token: Currency
): CurrencyAmount<Currency> | undefined {
  for (const field of [Field.CURRENCY_A, Field.CURRENCY_B]) {
    const amount = parsedAmounts[field]
    const currency = currencies[field]
    if (amount && currency?.wrapped.equals(token.wrapped)) {
      return amount
    }
  }
  return undefined
}

export function Review({
  position,
  existingPosition,
  parsedAmounts,
  outOfRange,
  ticksAtLimit,
  currencies,
}: {
  position?: Position
  existingPosition?: Position
  parsedAmounts: { [field in Field]?: CurrencyAmount<Currency> }
  outOfRange: boolean
  ticksAtLimit: { [bound in Bound]?: boolean | undefined }
  currencies: { [field in Field]?: Currency }
}) {
  const previewPosition = existingPosition ?? position

  const depositAmount0 = useMemo(() => {
    if (!existingPosition || !previewPosition) return undefined
    return depositAmountForToken(parsedAmounts, currencies, previewPosition.pool.token0)
  }, [currencies, existingPosition, parsedAmounts, previewPosition])

  const depositAmount1 = useMemo(() => {
    if (!existingPosition || !previewPosition) return undefined
    return depositAmountForToken(parsedAmounts, currencies, previewPosition.pool.token1)
  }, [currencies, existingPosition, parsedAmounts, previewPosition])

  const baseCurrencyDefault = useMemo(() => {
    if (!previewPosition) return undefined
    const { base } = getPriceOrderingFromPositionForUI(previewPosition)
    return base ? unwrappedToken(base) : undefined
  }, [previewPosition])

  return (
    <Wrapper>
      <AutoColumn gap="lg">
        {previewPosition ? (
          <PositionPreview
            position={previewPosition}
            inRange={!outOfRange}
            ticksAtLimit={ticksAtLimit}
            title={<Trans>Selected range</Trans>}
            depositAmount0={depositAmount0}
            depositAmount1={depositAmount1}
            statusPosition={existingPosition ?? position}
            baseCurrencyDefault={baseCurrencyDefault}
          />
        ) : null}
      </AutoColumn>
    </Wrapper>
  )
}
