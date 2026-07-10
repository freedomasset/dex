import React from 'react'
import { TYPE } from 'theme'
import styled from 'styled-components'

const Wrapper = styled(TYPE.main)<{ fontWeight: number; fontSize: string; negative: boolean; neutral: boolean }>`
  font-size: ${({ fontSize }) => fontSize};
  font-weight: ${({ fontWeight }) => fontWeight};
  color: ${({ theme, negative }) => (negative ? '#FF3E59' : '#00FFF1')};
`

const BoxPercentWrapper = styled.div`
  background: #182127;
  border-radius: 13px;
  padding: 3px 10px;
  color: #00FFF1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: fit-content;
`

export interface LogoProps {
  value: number | undefined
  decimals?: number
  fontSize?: string
  fontWeight?: number
  wrap?: boolean
  simple?: boolean
  box?: boolean
}

export default function Percent({
  value,
  decimals = 2,
  fontSize = '16px',
  fontWeight = 500,
  wrap = false,
  simple = false,
  box = false,
  ...rest
}: LogoProps) {
  if (value === undefined || value === null) {
    return (
      <TYPE.main fontWeight={fontWeight} fontSize={fontSize}>
        -
      </TYPE.main>
    )
  }

  const truncated = parseFloat(value.toFixed(decimals))

  if (simple) {
    return (
      <Wrapper {...rest} fontWeight={fontWeight} fontSize={fontSize} negative={false} neutral={true}>
        {Math.abs(value).toFixed(decimals)}%
      </Wrapper>
    )
  }

  if (box) {
    return (
      <BoxPercentWrapper>
        <Wrapper {...rest} fontWeight={fontWeight} fontSize={fontSize} lineHeight="20px" negative={false} neutral={true} color="#00FFF1">
          {Math.abs(value).toFixed(decimals)}%
        </Wrapper>
      </BoxPercentWrapper>
    )
  }

  return (
    <Wrapper {...rest} fontWeight={fontWeight} fontSize={fontSize} negative={truncated < 0} neutral={truncated === 0}>
      {wrap && '('}
      {truncated < 0 && '-'}
      {truncated > 0 && '+'}
      {Math.abs(value).toFixed(decimals)}%{wrap && ')'}
    </Wrapper>
  )
}
