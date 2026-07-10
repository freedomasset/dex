import React from 'react'
import styled from 'styled-components'
import CurrencyLogo from '../CurrencyLogo'

const Wrapper = styled.div<{ $margin: boolean; $sizeraw: number }>`
  position: relative;
  display: flex;
  flex-direction: row;
  margin-right: ${({ $sizeraw, $margin }) => $margin && ($sizeraw / 3 + 8).toString() + 'px'};
`

interface DoubleCurrencyLogoProps {
  margin?: boolean
  size?: number
  address0?: string
  address1?: string
  symbol0?: string
  symbol1?: string
}

const HigherLogo = styled(CurrencyLogo)`
  z-index: 2;
`

export default function DoubleCurrencyLogo({ 
  address0, 
  address1, 
  size = 16, 
  margin = false,
  symbol0,
  symbol1,
}: DoubleCurrencyLogoProps) {
  return (
    <Wrapper $sizeraw={size} $margin={margin}>
      {address0 && <HigherLogo address={address0} symbol={symbol0} size={size.toString() + 'px'} />}
      {address1 && <CurrencyLogo address={address1} symbol={symbol1} size={size.toString() + 'px'} />}
    </Wrapper>
  )
}
