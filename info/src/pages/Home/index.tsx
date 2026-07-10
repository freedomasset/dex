import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import styled from 'styled-components'
import { AutoColumn } from 'components/Column'
import { useTranslation } from 'react-i18next'
import { TYPE } from 'theme'
import { ResponsiveRow, RowBetween, RowFixed } from 'components/Row'
import LineChart from 'components/LineChart/alt'
import useTheme from 'hooks/useTheme'
import { useProtocolChartData, useProtocolData, useProtocolTransactions } from 'state/protocol/hooks'
import { DarkGreyCard } from 'components/Card'
import { formatDollarAmount } from 'utils/numbers'
import Percent from 'components/Percent'
import { HideMedium, HideSmall, StyledInternalLink } from '../../theme/components'
import TokenTable from 'components/tokens/TokenTable'
import PoolTable from 'components/pools/PoolTable'
import { PageWrapper, ThemedBackgroundGlobal } from 'pages/styled'
import { unixToDate } from 'utils/date'
import BarChart from 'components/BarChart/alt'
import { useAllPoolData } from 'state/pools/hooks'
import { notEmpty } from 'utils'
import TransactionsTable from '../../components/TransactionsTable'
import { useAllTokenData } from 'state/tokens/hooks'
import { useTopPoolAddresses } from 'data/pools/topPools'
import { useTopTokenAddresses } from 'data/tokens/topTokens'
import { MonoSpace } from 'components/shared'
import { useActiveNetworkVersion } from 'state/application/hooks'
import { useTransformedVolumeData } from 'hooks/chart'
import { SmallOptionButton } from 'components/Button'
import { VolumeWindow } from 'types'
import { Trace } from '@uniswap/analytics'
import { useLocation } from 'react-router-dom'
import { toWithPreservedRouterSearch } from 'utils/withPreservedRouterSearch'
// import HeaderImage from '../../assets/images/banner.svg'
import HeaderImage from '../../assets/images/simpleFlow/banner.webp'
import volumeIcon from '../../assets/images/simpleFlow/volume.webp'
import feesIcon from '../../assets/images/simpleFlow/fees.webp'

const ChartWrapper = styled.div`
  width: 49%;

  ${({ theme }) => theme.mediaWidth.upToSmall`
    width: 100%;
  `};
`
const StyledTraceContainer = styled.div`
  width: 100vw!important;
  height: 646px;
  position: relative;
  max-width: 100vw!important;
`
const StyledBoxContainer = styled.div`
  position: relative;
  padding: 20px 28px;
  background: #0D0D0D;
  border-radius: 18px;
  height: 140px;
  border: 1px solid #3A3A3A;
  flex: 1;
`

const StatsRow = styled(RowBetween)`
  align-items: stretch;
`

const LeftStatsColumn = styled.div`
  width: 100%;
  // margin-right: 24px;
  display: flex;
  // flex-direction: column;
  gap: 24px;
`

const RightStatsColumn = styled.div`
  width: 100%;
  // width: calc(100% - 370px);
  display: flex;
  flex-direction: column;
`

const BoxWithMargin = styled(StyledBoxContainer)`
  // margin-bottom: 24px;
  flex: 1;
`

const FullHeightBox = styled(StyledBoxContainer)`
  height: 100%;
  display: flex;
  flex-direction: column;
`

const BoxIcon = styled.img`
  width: 30px;
  height: 30px;
  position: absolute;
  right: 13px;
  top: 16px;
`

const StatsValueRow = styled.div`
  display: flex;
  align-items: center;
`

const StatsTitle = styled(TYPE.main)`
  margin-bottom: 28px!important;
  font-family: 'BarlowCondensed';
  font-size: 24px;
  color: #7E98A7;
`

const StatsTitleSmall = styled(TYPE.main)`
  margin-bottom: 8px!important;
  font-size: 18px;
  color: #7E98A7;
`

const StatsValue = styled(TYPE.label)`
  font-size: 36px;
  font-weight: 400;
  padding-right: 18px;
`

const TabContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 57px;
`

const TabButton = styled.button<{ $active: boolean }>`
  font-family: 'BarlowCondensed';
  background: none;
  border: none;
  padding: 0;
  padding-bottom: 10px;
  cursor: pointer;
  position: relative;
  color: ${({ $active }) => ($active ? '#FFFFFF' : '#7E98A7')};
  font-size: 30px;
  font-weight: 500;
  transition: color 0.3s ease;

  &::after {
    content: '';
    position: absolute;
    bottom: -1px;
    width: 32px;
    border-radius: 2px;
    left: 50%;
    transform: translateX(-50%) scaleX(${({ $active }) => ($active ? 1 : 0)});
    height: 4px;
    background-color: #FFFFFF;
    opacity: ${({ $active }) => ($active ? 1 : 0)};
    transition: opacity 0.3s ease, transform 0.3s ease;
  }

  &:hover {
    color: #FFFFFF;
    
    &::after {
      opacity: ${({ $active }) => ($active ? 1 : 0.5)};
    }
  }
`

const TabContent = styled.div`
  width: 100%;
  background: #141414;
  border-radius: 8px;
  overflow: hidden;
`

const TabHeader = styled(RowBetween)`
  margin-bottom: 24px;
  margin-top: 62px;
`

export default function Home() {
  const { t } = useTranslation()
  const { search } = useLocation()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  const theme = useTheme()

  const [activeNetwork] = useActiveNetworkVersion()

  const [protocolData] = useProtocolData()
  const [transactions] = useProtocolTransactions()
  const [chartData] = useProtocolChartData()

  const [volumeHover, setVolumeHover] = useState<number | undefined>()
  const [liquidityHover, setLiquidityHover] = useState<number | undefined>()
  const [leftLabel, setLeftLabel] = useState<string | undefined>()
  const [rightLabel, setRightLabel] = useState<string | undefined>()

  useEffect(() => {
    setLiquidityHover(undefined)
    setVolumeHover(undefined)
  }, [activeNetwork])

  // get all the pool datas that exist
  const allPoolData = useAllPoolData()
  const poolDatas = useMemo(() => {
    return Object.values(allPoolData)
      .map((p) => p.data)
      .filter(notEmpty)
  }, [allPoolData])

  // check if pools are still loading
  const { loading: poolsAddressesLoading, addresses: poolAddresses } = useTopPoolAddresses()
  
  // check if there are pools with data still loading (data is undefined)
  const poolsDataLoading = useMemo(() => {
    return Object.values(allPoolData).some((p) => !p.data && !p.lastUpdated)
  }, [allPoolData])
  
  // combine loading states: addresses loading OR (has addresses but data loading) OR data loading
  const poolsLoading = poolsAddressesLoading || (poolAddresses && poolAddresses.length > 0 && poolsDataLoading) || poolsDataLoading

  // if hover value undefined, reset to current day value
  useEffect(() => {
    if (volumeHover === undefined && protocolData) {
      setVolumeHover(protocolData.volumeUSD)
    }
  }, [protocolData, volumeHover])
  useEffect(() => {
    if (liquidityHover === undefined && protocolData) {
      setLiquidityHover(protocolData.tvlUSD)
    }
  }, [liquidityHover, protocolData])

  const formattedTvlData = useMemo(() => {
    if (chartData) {
      return chartData.map((day) => {
        return {
          time: unixToDate(day.date),
          value: day.tvlUSD,
        }
      })
    } else {
      return []
    }
  }, [chartData])

  const formattedVolumeData = useMemo(() => {
    if (chartData) {
      return chartData.map((day) => {
        return {
          time: unixToDate(day.date),
          value: day.volumeUSD,
        }
      })
    } else {
      return []
    }
  }, [chartData])

  const weeklyVolumeData = useTransformedVolumeData(chartData, 'week')
  const monthlyVolumeData = useTransformedVolumeData(chartData, 'month')

  const allTokens = useAllTokenData()

  const formattedTokens = useMemo(() => {
    return Object.values(allTokens)
      .map((t) => t.data)
      .filter(notEmpty)
  }, [allTokens])

  // check if tokens are still loading
  const { loading: tokensAddressesLoading, addresses: tokenAddresses } = useTopTokenAddresses()
  
  // check if there are tokens with data still loading (data is undefined)
  const tokensDataLoading = useMemo(() => {
    return Object.values(allTokens).some((t) => !t.data && !t.lastUpdated)
  }, [allTokens])
  
  // combine loading states: addresses loading OR (has addresses but data loading) OR data loading
  const tokensLoading = tokensAddressesLoading || (tokenAddresses && tokenAddresses.length > 0 && tokensDataLoading) || tokensDataLoading

  const [volumeWindow, setVolumeWindow] = useState(VolumeWindow.weekly)
  const [activeTab, setActiveTab] = useState<'tokens' | 'pools'>('tokens')

  const tvlValue = useMemo(() => {
    if (liquidityHover) {
      return formatDollarAmount(liquidityHover, 2, true)
    }
    return formatDollarAmount(protocolData?.tvlUSD, 2, true)
  }, [liquidityHover, protocolData?.tvlUSD])

  const volumeValue = useMemo(() => {
    if (volumeHover) {
      return formatDollarAmount(volumeHover, 2, true)
    }
    return formatDollarAmount(protocolData?.volumeUSD, 2, true)
  }, [volumeHover, protocolData?.volumeUSD])

  const volumeHoverRef = useRef<number | undefined>()
  const liquidityHoverRef = useRef<number | undefined>()
  const leftLabelRef = useRef<string | undefined>()
  const rightLabelRef = useRef<string | undefined>()

  useEffect(() => {
    requestAnimationFrame(() => {
      setLiquidityHover(liquidityHoverRef.current)
      setLeftLabel(leftLabelRef.current)
    })
  })

  useEffect(() => {
    requestAnimationFrame(() => {
      setVolumeHover(volumeHoverRef.current)
      setRightLabel(rightLabelRef.current)
    })
  })

  useEffect(() => {
    if (protocolData) {
      setVolumeHover(protocolData.volumeUSD)
      setLiquidityHover(protocolData.tvlUSD)
    }
  }, [protocolData])

  return (
    <Trace page={'home-page'} shouldLogImpression>
      <StyledTraceContainer>
        <img src={HeaderImage} alt="Protocol Overview" style={{ width: '100%', height: '646px' }} />
        <div style={{width: '80%', position: 'absolute', top: '100px', left: '50%', transform: 'translate(-50%, 0%)', textAlign: 'center' }}>
          <TYPE.main fontSize="82px" fontFamily="BarlowCondensed" fontWeight="400" mb="32px" color="white" style={{lineHeight: '56px'}}>
            {t('protocolOverview')}
          </TYPE.main>
          {/* <TYPE.subHeader style={{ width: '390px', margin: '0 auto', lineHeight: '28px', color: 'rgba(255,255,255,0.6)' }}>{t('protocolOverviewDesc')}</TYPE.subHeader> */}
        </div>
      </StyledTraceContainer>
      <PageWrapper style={{ marginTop: '-270px', zIndex: 2 }}>
        <AutoColumn $gap="16px">
          {/* <TYPE.main>Data DEX Overview</TYPE.main> */}
          <HideSmall>
            <StatsRow>
              <LeftStatsColumn>
                <BoxWithMargin>
                  <BoxIcon src={volumeIcon} alt="Volume" />
                  <StatsTitle>{t('volume24h')}</StatsTitle>
                  <StatsValueRow>
                    <StatsValue>{formatDollarAmount(protocolData?.volumeUSD)}</StatsValue>
                    <Percent fontSize="14px" fontWeight={400} value={protocolData?.volumeUSDChange} wrap={false} box={true} />
                  </StatsValueRow>
                </BoxWithMargin>
                <StyledBoxContainer>
                  <BoxIcon src={feesIcon} alt="Fees" />
                  <StatsTitle>{t('fees24h')}</StatsTitle>
                  <StatsValueRow>
                    <StatsValue>{formatDollarAmount(protocolData?.feesUSD)}</StatsValue>
                    <Percent fontSize="14px" fontWeight={400} value={protocolData?.feeChange} wrap={false} box={true} />
                  </StatsValueRow>
                </StyledBoxContainer>
                <StyledBoxContainer>
                  {/* <BoxIcon src={feesIcon} alt="Fees" /> */}
                  <StatsTitle>{t('totalValueLocked')}</StatsTitle>
                  <StatsValueRow>
                    <StatsValue>{formatDollarAmount(protocolData?.tvlUSD)}</StatsValue>
                    <Percent fontSize="14px" value={protocolData?.tvlUSDChange} wrap={false} box={true} />
                  </StatsValueRow>
                </StyledBoxContainer>
              </LeftStatsColumn>
              {/* <RightStatsColumn>
                <FullHeightBox>
                  <StatsTitleSmall>{t('totalValueLocked')}</StatsTitleSmall>
                  <StatsValueRow>
                    <StatsValue>{formatDollarAmount(protocolData?.tvlUSD)}</StatsValue>
                    <Percent fontSize="14px" value={protocolData?.tvlUSDChange} wrap={false} box={true} />
                  </StatsValueRow>
                </FullHeightBox>
              </RightStatsColumn> */}
            </StatsRow>
          </HideSmall>
          <TabHeader>
            <TabContainer>
              <TabButton $active={activeTab === 'tokens'} onClick={() => setActiveTab('tokens')}>
                {t('topTokens')}
              </TabButton>
              <TabButton $active={activeTab === 'pools'} onClick={() => setActiveTab('pools')}>
                {t('topPools')}
              </TabButton>
            </TabContainer>
            <StyledInternalLink to={toWithPreservedRouterSearch(activeTab === 'tokens' ? '/tokens' : '/pools', search)}>
              <TYPE.main fontSize="20px" fontFamily="BarlowCondensed" fontWeight="400" color="white">
                {t('explore')}
              </TYPE.main>
            </StyledInternalLink>
          </TabHeader>
          <TabContent>
            {activeTab === 'tokens' ? (
              <TokenTable tokenDatas={formattedTokens} isLoading={tokensLoading} />
            ) : (
              <PoolTable poolDatas={poolDatas} isLoading={poolsLoading} />
            )}
          </TabContent>
        </AutoColumn>
      </PageWrapper>
    </Trace>
  )
}
