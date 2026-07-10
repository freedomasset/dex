import React, { useCallback, useState, useMemo, useEffect } from 'react'
import styled from 'styled-components'
import { Link, useLocation } from 'react-router-dom'
import { TYPE } from 'theme'
import { DarkGreyCard, GreyBadge } from 'components/Card'
import Loader, { LoadingRows } from 'components/Loader'
import { AutoColumn } from 'components/Column'
import { RowFixed } from 'components/Row'
import { formatDollarAmount } from 'utils/numbers'
import { toWithPreservedRouterSearch } from 'utils/withPreservedRouterSearch'
import { PoolData } from 'state/pools/reducer'
import DoubleCurrencyLogo from 'components/DoubleLogo'
import { feeTierPercent } from 'utils'
import { Label, ClickableText } from 'components/Text'
import { PageButtons, Arrow, Break } from 'components/shared'
import { POOL_ALLOW_LIST } from '../../constants/index'
import useTheme from 'hooks/useTheme'
import { useActiveNetworkVersion } from 'state/application/hooks'
import { useTranslation } from 'react-i18next'

const Wrapper = styled(DarkGreyCard)`
  width: 100%;
`

const ResponsiveGrid = styled.div`
  display: grid;
  grid-gap: 1em;
  align-items: center;

  grid-template-columns: 20px 3.5fr repeat(4, 1fr);

  @media screen and (max-width: 900px) {
    grid-template-columns: 20px 1.5fr repeat(3, 1fr);
    & :nth-child(3) {
      display: none;
    }
  }

  @media screen and (max-width: 700px) {
    grid-template-columns: 20px 1.5fr repeat(2, 1fr);
    & :nth-child(4) {
      display: none;
    }
  }

  @media screen and (max-width: 500px) {
    grid-template-columns: 20px 1.5fr repeat(1, 1fr);
    & :nth-child(5) {
      display: none;
    }
  }

  @media screen and (max-width: 480px) {
    grid-template-columns: 2.5fr repeat(1, 1fr);
    > *:nth-child(1) {
      display: none;
    }
  }
`

const LinkWrapper = styled(Link)`
  text-decoration: none;
  :hover {
    cursor: pointer;
    opacity: 0.7;
  }
`

const SORT_FIELD = {
  feeTier: 'feeTier',
  volumeUSD: 'volumeUSD',
  tvlUSD: 'tvlUSD',
  apy: 'apy',
  fees24h: 'fees24h',
}

// Helper functions for calculations
const calculate24hFees = (volumeUSD: number, feeTier: number): number => {
  return volumeUSD * (feeTier / 1000000)
}

const calculateAPY = (volumeUSD: number, feeTier: number, tvlUSD: number): number => {
  if (tvlUSD === 0) return 0
  const dailyFees = calculate24hFees(volumeUSD, feeTier)
  return (dailyFees * 365) / tvlUSD * 100
}

const formatPercentage = (value: number): string => {
  if (value === 0) return '0%'
  if (value < 0.01) return '<0.01%'
  return `${value.toFixed(2)}%`
}

const DataRow = ({ poolData, index }: { poolData: PoolData; index: number }) => {
  const fees24h = calculate24hFees(poolData.volumeUSD, poolData.feeTier)
  const apy = calculateAPY(poolData.volumeUSD, poolData.feeTier, poolData.tvlUSD)
  const { search } = useLocation()

  return (
    <LinkWrapper to={toWithPreservedRouterSearch(`/pools/${poolData.address}`, search)}>
      <ResponsiveGrid>
        <Label fontWeight={400}>{index + 1}</Label>
        <Label fontWeight={400}>
          {/* @ts-ignore */}
          <RowFixed>
            <DoubleCurrencyLogo address0={poolData.token0.address} address1={poolData.token1.address} symbol0={poolData.token0.symbol} symbol1={poolData.token1.symbol} />
            <TYPE.label ml="8px">
              {poolData.token0.symbol}/{poolData.token1.symbol}
            </TYPE.label>
            <GreyBadge ml="10px" fontSize="14px">
              {feeTierPercent(poolData.feeTier)}
            </GreyBadge>
          </RowFixed>
        </Label>
        <Label end={1} fontWeight={400}>
          {formatPercentage(apy)}
        </Label>
        <Label end={1} fontWeight={400}>
          {formatDollarAmount(fees24h)}
        </Label>
        <Label end={1} fontWeight={400}>
          {formatDollarAmount(poolData.volumeUSD)}
        </Label>
        <Label end={1} fontWeight={400}>
          {formatDollarAmount(poolData.tvlUSD)}
        </Label>
      </ResponsiveGrid>
    </LinkWrapper>
  )
}

const MAX_ITEMS = 10

export default function PoolTable({ 
  poolDatas, 
  maxItems = MAX_ITEMS,
  isLoading = false,
}: { 
  poolDatas: PoolData[]
  maxItems?: number
  isLoading?: boolean
}) {
  const [currentNetwork] = useActiveNetworkVersion()
  const { t } = useTranslation()
  // theming
  const theme = useTheme()

  // for sorting
  const [sortField, setSortField] = useState(SORT_FIELD.tvlUSD)
  const [sortDirection, setSortDirection] = useState<boolean>(true)

  // pagination
  const [page, setPage] = useState(1)
  const [maxPage, setMaxPage] = useState(1)
  useEffect(() => {
    let extraPages = 1
    if (poolDatas.length % maxItems === 0) {
      extraPages = 0
    }
    setMaxPage(Math.floor(poolDatas.length / maxItems) + extraPages)
  }, [maxItems, poolDatas])

  const sortedPools = useMemo(() => {
    const allowList = POOL_ALLOW_LIST[currentNetwork.id] || []
    return poolDatas
      ? poolDatas
          .filter((x) => !!x && (allowList.length === 0 || allowList.includes(x.address.toLowerCase())))
          .sort((a, b) => {
            if (a && b) {
              let aValue: number, bValue: number
              
              // Handle special calculated fields
              if (sortField === SORT_FIELD.apy) {
                aValue = calculateAPY(a.volumeUSD, a.feeTier, a.tvlUSD)
                bValue = calculateAPY(b.volumeUSD, b.feeTier, b.tvlUSD)
              } else if (sortField === SORT_FIELD.fees24h) {
                aValue = calculate24hFees(a.volumeUSD, a.feeTier)
                bValue = calculate24hFees(b.volumeUSD, b.feeTier)
              } else {
                aValue = a[sortField as keyof PoolData] as number
                bValue = b[sortField as keyof PoolData] as number
              }
              
              return aValue > bValue
                ? (sortDirection ? -1 : 1) * 1
                : (sortDirection ? -1 : 1) * -1
            } else {
              return -1
            }
          })
          .slice(maxItems * (page - 1), page * maxItems)
      : []
  }, [currentNetwork.id, maxItems, page, poolDatas, sortDirection, sortField])

  const handleSort = useCallback(
    (newField: string) => {
      setSortField(newField)
      setSortDirection(sortField !== newField ? true : !sortDirection)
    },
    [sortDirection, sortField],
  )

  const arrow = useCallback(
    (field: string) => {
      return sortField === field ? (!sortDirection ? '↑' : '↓') : ''
    },
    [sortDirection, sortField],
  )

  if (!poolDatas) {
    return <Loader />
  }

  // 如果数据为空且不在加载中，显示空状态
  if (sortedPools.length === 0 && !isLoading) {
    return (
      <Wrapper>
        <AutoColumn style={{ padding: '40px', textAlign: 'center' }}>
          <TYPE.main fontSize={18} fontWeight={400} color={theme?.text3}>
            {t('noPoolsFound') || 'No pools found'}
          </TYPE.main>
        </AutoColumn>
      </Wrapper>
    )
  }

  return (
    <Wrapper>
      {sortedPools.length > 0 ? (
        <AutoColumn $gap="16px">
          <ResponsiveGrid>
            <Label color={'rgba(255,255,255,0.5)'}>#</Label>
            <ClickableText color={theme?.text2} onClick={() => handleSort(SORT_FIELD.feeTier)}>
              {t('pool')} {arrow(SORT_FIELD.feeTier)}
            </ClickableText>
            <ClickableText color={theme?.text2} end={1} onClick={() => handleSort(SORT_FIELD.apy)}>
              {t('apy')} {arrow(SORT_FIELD.apy)}
            </ClickableText>
            <ClickableText color={theme?.text2} end={1} onClick={() => handleSort(SORT_FIELD.fees24h)}>
              {t('tableFees24h')} {arrow(SORT_FIELD.fees24h)}
            </ClickableText>
            <ClickableText color={theme?.text2} end={1} onClick={() => handleSort(SORT_FIELD.volumeUSD)}>
              {t('tableVolume24h')} {arrow(SORT_FIELD.volumeUSD)}
            </ClickableText>
            <ClickableText color={theme?.text2} end={1} onClick={() => handleSort(SORT_FIELD.tvlUSD)}>
              {t('tvl')} {arrow(SORT_FIELD.tvlUSD)}
            </ClickableText>
          </ResponsiveGrid>
          <Break />
          {sortedPools.map((poolData, i) => {
            if (poolData) {
              return (
                <React.Fragment key={i}>
                  <DataRow index={(page - 1) * MAX_ITEMS + i} poolData={poolData} />
                  <Break />
                </React.Fragment>
              )
            }
            return null
          })}
          <PageButtons>
            <div
              onClick={() => {
                setPage(page === 1 ? page : page - 1)
              }}
            >
              <Arrow $faded={page === 1 ? true : false}>←</Arrow>
            </div>
            <TYPE.body>{'Page ' + page + ' of ' + maxPage}</TYPE.body>
            <div
              onClick={() => {
                setPage(page === maxPage ? page : page + 1)
              }}
            >
              <Arrow $faded={page === maxPage ? true : false}>→</Arrow>
            </div>
          </PageButtons>
        </AutoColumn>
      ) : (
        <LoadingRows>
          <div />
          <div />
          <div />
          <div />
          <div />
          <div />
          <div />
          <div />
          <div />
          <div />
          <div />
          <div />
        </LoadingRows>
      )}
    </Wrapper>
  )
}