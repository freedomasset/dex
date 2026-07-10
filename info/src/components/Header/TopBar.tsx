import React from 'react'
import styled from 'styled-components'
import { AutoRow, RowBetween, RowFixed } from 'components/Row'
import { ExternalLink, TYPE } from 'theme'
import { useEthPrices } from 'hooks/useEthPrices'
import { formatDollarAmount } from 'utils/numbers'
import Polling from './Polling'
import { useActiveNetworkVersion } from '../../state/application/hooks'
import { SupportedNetwork } from '../../constants/networks'
import { ChainId } from '@vanadex/sdk-core'
import { TT_CHAIN_TESTNET_CHAIN_ID, TT_CHAIN_MAINNET_CHAIN_ID } from 'constants/chains'

const Wrapper = styled.div`
  width: 100%;
  background-color: ${({ theme }) => theme.black};
  padding: 10px 20px;
`

const Item = styled(TYPE.main)`
  font-size: 12px;
`

const StyledLink = styled(ExternalLink)`
  font-size: 12px;
  color: ${({ theme }) => theme.text1};
`

const TopBar = () => {
  const ethPrices = useEthPrices()
  const [activeNetwork] = useActiveNetworkVersion()
  return (
    <Wrapper>
      <RowBetween>
        <Polling />
        <AutoRow $gap="6px">
          <RowFixed>
            {activeNetwork.chainId === ChainId.MAINNET || activeNetwork.chainId === ChainId.SEPOLIA ? (
              <Item>ETH Price:</Item>
            ) : activeNetwork.chainId === ChainId.POLYGON ? (
              <Item>MATIC Price:</Item>
            ) : activeNetwork.chainId === ChainId.BNB ? (
              <Item>BNB Price:</Item>
            ) : activeNetwork.chainId === TT_CHAIN_TESTNET_CHAIN_ID ||
              activeNetwork.chainId === TT_CHAIN_MAINNET_CHAIN_ID ? (
              <Item>TT Price:</Item>
            ) : activeNetwork.id === SupportedNetwork.AVALANCHE ? (
              <Item>AVAX Price:</Item>
            ) : (
              <Item>ETH Price:</Item>
            )}
            <Item fontWeight="700" ml="4px">
              {formatDollarAmount(ethPrices?.current)}
            </Item>
          </RowFixed>
        </AutoRow>
        <AutoRow $gap="6px" style={{ justifyContent: 'flex-end' }}>
          <StyledLink href="https://freedomasset.global/">Docs</StyledLink>
          <StyledLink href="https://dex.freedomasset.global">App</StyledLink>
        </AutoRow>
      </RowBetween>
    </Wrapper>
  )
}

export default TopBar
