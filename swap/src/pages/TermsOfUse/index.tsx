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

export default function TermsOfUse() {
  const { search } = useLocation()
  const Title = useIsMobile() ? ThemedText.LargeHeader : ThemedText.Hero
  return (
    <PageWrapper>
      <Header>
        <Container>
          <Title>DataDex Terms of Use</Title>
        </Container>
      </Header>
      <AutoColumn gap="md">
        <MarkDownWrapper>
          <ReactMarkdown
            source={`# DataDex Terms of Use

Welcome to DataDex, a non-custodial Web3 trading application. By accessing or using our services, you agree to be bound by these Terms of Use.

## 1. Acceptance of Terms

By using DataDex, you agree to these Terms of Use and our Privacy Policy. If you do not agree, please do not use our services.

## 2. Service Description

DataDex is a non-custodial Web3 trading platform. We do not hold or control your assets. You are solely responsible for managing your private keys and wallet security.

## 3. User Responsibilities

As a DataDex user, you agree to:

- Provide accurate and complete information
- Maintain the security of your account and private keys
- Comply with all applicable laws and regulations
- Use the platform responsibly and not for any illegal activities

## 4. Risks and Disclaimers

## Trading Risks

Cryptocurrency trading involves significant risk. You may lose all your invested capital. Trade responsibly and within your means.

## Technology Risks

Web3 technologies are experimental. We are not responsible for any losses due to blockchain network issues, smart contract vulnerabilities, or wallet compromises.

## No Investment Advice

DataDex does not provide investment advice. All trading decisions are your sole responsibility.

## 5. Intellectual Property

All content and technology on DataDex are our exclusive property. You may not copy, modify, or distribute our content without permission.

## 6. Limitation of Liability

To the fullest extent permitted by law, DataDex and its affiliates shall not be liable for any indirect, incidental, special, consequential, or punitive damages.

## 7. Indemnification

You agree to indemnify and hold DataDex harmless from any claims, losses, or damages arising from your use of our services or violation of these terms.

## 8. Modifications to Service

We reserve the right to modify or discontinue DataDex at any time without notice.

## 9. Governing Law

These terms are governed by UK law, without regard to its conflict of law provisions.

## 10. Dispute Resolution

Any disputes arising from these terms will be resolved through binding arbitration in accordance with UK Arbitration Rules.

## 11. Severability

If any provision of these terms is found to be unenforceable, the remaining provisions will remain in full force and effect.

## 12. Entire Agreement

These Terms of Use constitute the entire agreement between you and DataDex regarding the use of our services.

## 13. Contact Information

For any questions regarding these Terms of Use, please contact us through twitter @vanadatadex or email vanadatadex@gmail.com

Last Updated: December 15, 2024

By using DataDex, you acknowledge that you have read, understood, and agree to be bound by these Terms of Use.`.replace(
              /[\n\r]/g,
              '\n'
            )}
          />
        </MarkDownWrapper>
      </AutoColumn>
      <SmallButtonPrimary as={Link} to={toWithPreservedRouterSearch('/', search)}>
        <Trans>Back to swapping!</Trans>
      </SmallButtonPrimary>
    </PageWrapper>
  )
}
