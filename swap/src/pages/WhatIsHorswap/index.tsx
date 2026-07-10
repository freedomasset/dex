import { Trans } from '@lingui/macro'
import { SmallButtonPrimary } from 'components/Button'
import { AutoColumn } from 'components/Column'
import { useIsMobile } from 'nft/hooks'
import ReactMarkdown from 'react-markdown'
import { Link, useLocation } from 'react-router-dom'
import styled from 'styled-components'
import { ThemedText } from 'theme/components'
import { toWithPreservedRouterSearch } from 'utils/withPreservedRouterSearch'

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`

const Header = styled(Container)`
  gap: 30px;
`

const PageWrapper = styled(Container)`
  flex: 1;
  justify-content: center;
  gap: 50px;
  padding: 10px;

  @media screen and (min-width: ${({ theme }) => theme.breakpoint.md}px) {
    justify-content: space-between;
    padding-top: 64px;
  }
`
const MarkDownWrapper = styled.div`
  max-width: 1024px;
  overflow: hidden;
`

export default function WhatIsHorswap() {
  const { search } = useLocation()
  const Title = useIsMobile() ? ThemedText.LargeHeader : ThemedText.Hero
  return (
    <PageWrapper>
      <Header>
        <Container>
          <Title>What is Horswap?</Title>
        </Container>
      </Header>
      <AutoColumn gap="md">
        <MarkDownWrapper>
          <ReactMarkdown
            source={`# Horswap is an improved Uniswap Interface
Horswap is a fork of [Uniswap Interface v4.266.2](https://github.com/Uniswap/interface/releases/tag/v4.266.2). The version v4.266.2 is the last version without added UI fees and that would still allow users to do local routing. Horswap has then significantly improved the interface's censorship resistance and privacy.

Here are the significant changes:
- Changed Uniswap branding to Horswap branding
- Removed Uniswap privacy policy
- Removed all analytics queries (Uniswap interface is really noisy in reporting everything you do to their analytics system)
- Removed support for wallet connect wallets (Unfortunately these require centralized server to function)
- Changed socials to point to dark.florist equivalents
- Removed copyright notices for Uniswap
- Removed blacklisted tokens and user addresses
- Replaced the default RPC (Infura, which censors) with Keydonix (does not censor)
- Removed Moonpay (a centralized fiat payment processsor)
- Removed NFT related features (unfortunately these only function by using centralized services)
- Removed Subgraph (unfortunately this is also a centralized service)
- Removed pages that require subgraph (mini portfolio, portfolio, NFTs, token pages, pool details, search bar etc)
- Removed fiat currency selector (requires subgraph)
- Removed external routing, all routing is done using the default RPC or users wallet RPC
- Removed UniswapX (UniswapX depends on centralized servers)
- Settings have been moved to where the mini portfolio used to be
- Changed token pricing to be from a simulated swap with USDC, and it is shown to users that this is in USDC (not in dollars)
- Removed claim UNI tokens popup
- Added docker building and deployment to IPFS

You can see all the changes by [comparing Horswap to Uniswap Interface V4.266.2](https://github.com/Uniswap/interface/compare/v4.266.2...DarkFlorist:Horswap:main). You can also find the whole codebase in [GitHub](https://github.com/DarkFlorist/Horswap/).
					`.replace(/[\n\r]/g, '\n')}
          />
        </MarkDownWrapper>
      </AutoColumn>
      <SmallButtonPrimary as={Link} to={toWithPreservedRouterSearch('/', search)}>
        <Trans>Back to swapping!</Trans>
      </SmallButtonPrimary>
    </PageWrapper>
  )
}
