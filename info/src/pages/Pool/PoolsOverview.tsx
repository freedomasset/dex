import React, { useEffect, useMemo } from 'react'
import { PageWrapper } from 'pages/styled'
import { AutoColumn } from 'components/Column'
import { TYPE } from 'theme'
import PoolTable from 'components/pools/PoolTable'
import { useAllPoolData, usePoolDatas } from 'state/pools/hooks'
import { notEmpty } from 'utils'
import { useSavedPools } from 'state/user/hooks'
import { DarkGreyCard } from 'components/Card'
import { Trace } from '@uniswap/analytics'
// import TopPoolMovers from 'components/pools/TopPoolMovers'
import { useTranslation } from 'react-i18next'
export default function PoolPage() {
  const { t } = useTranslation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  // get all the pool datas that exist
  const allPoolData = useAllPoolData()
  const poolDatas = useMemo(() => {
    return Object.values(allPoolData)
      .map((p) => p.data)
      .filter(notEmpty)
  }, [allPoolData])

  const [savedPools] = useSavedPools()
  const watchlistPools = usePoolDatas(savedPools)

  return (
    <Trace page="pools-overview-page" shouldLogImpression>
      <PageWrapper style={{ paddingTop: '40px' }}>
        <AutoColumn $gap="lg">
          <TYPE.main fontSize={30} fontWeight={400} style={{ fontFamily: 'BarlowCondensed' }}>{t('yourWatchlist')}</TYPE.main>
          {watchlistPools.length > 0 ? (
            <PoolTable poolDatas={watchlistPools} />
          ) : (
            <DarkGreyCard>
              <TYPE.main fontSize={18} fontWeight={400}>{t('savedPoolsWillAppearHere')}</TYPE.main>
            </DarkGreyCard>
          )}
          <TYPE.main fontSize={30} fontWeight={400} style={{ fontFamily: 'BarlowCondensed' }}>{t('allPools')}</TYPE.main>
          <PoolTable poolDatas={poolDatas} />
        </AutoColumn>
      </PageWrapper>
    </Trace>
  )
}
