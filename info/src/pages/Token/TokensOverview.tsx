import React, { useMemo, useEffect } from 'react'
import { PageWrapper } from 'pages/styled'
import { AutoColumn } from 'components/Column'
import { TYPE, HideSmall } from 'theme'
import TokenTable from 'components/tokens/TokenTable'
import { useAllTokenData, useTokenDatas } from 'state/tokens/hooks'
import { notEmpty } from 'utils'
import { useSavedTokens } from 'state/user/hooks'
import { DarkGreyCard } from 'components/Card'
import TopTokenMovers from 'components/tokens/TopTokenMovers'
import { Trace } from '@uniswap/analytics'
import { useTranslation } from 'react-i18next'
export default function TokensOverview() {
  const { t } = useTranslation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  const allTokens = useAllTokenData()

  const formattedTokens = useMemo(() => {
    return Object.values(allTokens)
      .map((t) => t.data)
      .filter(notEmpty)
  }, [allTokens])

  const [savedTokens] = useSavedTokens()
  const watchListTokens = useTokenDatas(savedTokens)

  return (
    <Trace page="tokens-overview-page" shouldLogImpression>
      <PageWrapper style={{ paddingTop: '40px' }}>
        <AutoColumn $gap="lg">
          <TYPE.main fontSize={30} fontWeight={400} style={{ fontFamily: 'BarlowCondensed' }}>{t('yourWatchlist')}</TYPE.main>
          {savedTokens.length > 0 ? (
            <TokenTable tokenDatas={watchListTokens} />
          ) : (
            <DarkGreyCard>
              <TYPE.main fontSize={18} fontWeight={400}>{t('savedTokensWillAppearHere')}</TYPE.main>
            </DarkGreyCard>
          )}
          {/* <HideSmall>
            <DarkGreyCard style={{ paddingTop: '12px' }}>
              <AutoColumn $gap="md">
                <TYPE.mediumHeader fontSize="16px">Top Movers</TYPE.mediumHeader>
                <TopTokenMovers />
              </AutoColumn>
            </DarkGreyCard>
          </HideSmall> */}
          <TYPE.main fontSize={30} fontWeight={400} style={{ fontFamily: 'BarlowCondensed' }}>{t('allTokens')}</TYPE.main>
          <TokenTable tokenDatas={formattedTokens} />
        </AutoColumn>
      </PageWrapper>
    </Trace>
  )
}
