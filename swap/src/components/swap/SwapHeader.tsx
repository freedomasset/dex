import { Trans } from '@lingui/macro'
import { Percent } from '@vanadex/sdk-core'
import styled from 'styled-components'
import { ThemedText } from 'theme/components'

import { RowBetween, RowFixed } from '../Row'
import SettingsTab from '../Settings'

const StyledSwapHeader = styled(RowBetween)`
  margin-bottom: 25px;
  color: ${({ theme }) => theme.neutral2};
`

const HeaderButtonContainer = styled(RowFixed)`
  padding: 0 20px;
  gap: 16px;
`

export default function SwapHeader({ autoSlippage, chainId }: { autoSlippage: Percent; chainId?: number }) {
  return (
    <StyledSwapHeader>
      <HeaderButtonContainer>
        <ThemedText.SubHeader
          fontSize={36}
          fontWeight={400}
          lineHeight="40px"
          style={{ color: '#ffffff!important', fontFamily: 'BarlowCondensed' }}
        >
          <Trans>Swap</Trans>
        </ThemedText.SubHeader>
      </HeaderButtonContainer>
      <RowFixed>
        <SettingsTab autoSlippage={autoSlippage} chainId={chainId} />
      </RowFixed>
    </StyledSwapHeader>
  )
}
