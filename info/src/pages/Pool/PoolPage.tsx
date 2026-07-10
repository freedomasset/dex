import React, { useMemo, useState, useEffect, useCallback } from 'react'
import styled from 'styled-components'
import { useColor } from 'hooks/useColor'
import { ThemedBackground, PageWrapper } from 'pages/styled'
import { ExplorerDataType, feeTierPercent, getExplorerLink, isAddress } from 'utils'
import { AutoColumn } from 'components/Column'
import { RowBetween, RowFixed, AutoRow } from 'components/Row'
import { TYPE, StyledInternalLink } from 'theme'
import Loader, { LocalLoader } from 'components/Loader'
import { ExternalLink, Download } from 'react-feather'
import { ExternalLink as StyledExternalLink } from '../../theme/components'
import useTheme from 'hooks/useTheme'
import CurrencyLogo from 'components/CurrencyLogo'
import { formatDollarAmount, formatAmount, formatTokenAmount } from 'utils/numbers'
import Percent from 'components/Percent'
import { ButtonPrimary, ButtonGray, SavedIcon } from 'components/Button'
import { DarkGreyCard, GreyCard, GreyBadge } from 'components/Card'
import { usePoolDatas, usePoolChartData, usePoolTransactions } from 'state/pools/hooks'
import { unixToDate } from 'utils/date'
import { ToggleWrapper, ToggleElementFree } from 'components/Toggle/index'
import BarChart from 'components/BarChart/alt'
import DoubleCurrencyLogo from 'components/DoubleLogo'
import TransactionTable from 'components/TransactionsTable'
import { useSavedPools } from 'state/user/hooks'
import DensityChart from 'components/DensityChart'
import { MonoSpace } from 'components/shared'
import { useActiveNetworkVersion, useClients } from 'state/application/hooks'
import { EthereumNetworkInfo } from 'constants/networks'
import { GenericImageWrapper } from 'components/Logo'
import { Navigate, useLocation, useParams, useNavigate } from 'react-router-dom'
import { Trace } from '@uniswap/analytics'
import { ChainId } from '@vanadex/sdk-core'
import { useTranslation } from 'react-i18next'
import * as XLSX from 'xlsx-js-style'
import { fetchAllPoolTransactions } from 'data/pools/transactions'
import { TransactionType } from 'types'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import { enUS, zhCN, zhTW } from 'date-fns/locale'
import i18n from '../../i18n'
import focusIcon from '../../assets/images/simpleFlow/focus.png'
import focusHtIcon from '../../assets/images/simpleFlow/focusHt.png'
import { ArrowLeft } from 'react-feather'
import linkIcon from '../../assets/images/simpleFlow/link.png'
import { toWithPreservedRouterSearch } from 'utils/withPreservedRouterSearch'


// InterfacePageName is not defined in the original code, so we define it here
// this is only to replace the missing import for uniswap analytics which we do not use
enum InterfacePageName {
  POOL_PAGE = 'POOL_PAGE'
}

const ContentLayout = styled.div`
  display: grid;
  grid-template-columns: 300px 1fr;
  grid-gap: 1em;

  @media screen and (max-width: 800px) {
    grid-template-columns: 1fr;
    grid-template-rows: 1fr 1fr;
  }
`

const TokenButton = styled(GreyCard)`
  padding: 8px 12px;
  border-radius: 10px;
  :hover {
    cursor: pointer;
    opacity: 0.6;
  }
`

const BackButton = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background-color: ${({ theme }) => theme.bg2};
  border: none;
  border-radius: 8px;
  color: ${({ theme }) => theme.text2};
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background-color: ${({ theme }) => theme.bg3};
    color: ${({ theme }) => theme.text1};
  }
  
  svg {
    width: 16px;
    height: 16px;
  }
`

const StyledLink = styled.a`
  text-decoration: none;
  cursor: pointer;
  color: ${({ theme }) => theme.primary1};
  font-weight: 500;
  display: inline;
  flex-direction: center;
  align-items: center;
  display: flex;

  :hover {
    text-decoration: underline;
    text-decoration: none;
    opacity: 0.7;
  }

  :focus {
    outline: none;
    text-decoration: none;
  }

  :active {
    outline: none;
    text-decoration: none;
  }
`

const ResponsiveRow = styled(RowBetween)`
  ${({ theme }) => theme.mediaWidth.upToSmall`
    flex-direction: column;
    align-items: flex-start;
    row-gap: 24px;
    width: 100%:
  `};
`

const ToggleRow = styled(RowBetween)`
  @media screen and (max-width: 600px) {
    flex-direction: column;
  }
`

const StyledDatePickerWrapper = styled.div`
  .react-datepicker-wrapper {
    width: auto;
  }
  .react-datepicker__input-container {
    width: auto;
  }
  input {
    padding: 8px 12px;
    border-radius: 10px;
    border: 1px solid ${({ theme }) => theme.bg3 ?? '#2D3A47'};
    background: ${({ theme }) => theme.bg1 ?? '#1A2430'};
    color: ${({ theme }) => theme.text1 ?? '#FFFFFF'};
    font-size: 14px;
    font-family: inherit;
    outline: none;
    width: 140px;
    cursor: pointer;
    transition: border-color 0.2s;

    &:hover {
      border-color: ${({ theme }) => theme.primary1 ?? '#2172E5'};
    }

    &:focus {
      border-color: ${({ theme }) => theme.primary1 ?? '#2172E5'};
    }
  }

  .react-datepicker {
    font-family: inherit;
    background: ${({ theme }) => theme.bg1 ?? '#1A2430'};
    border: 1px solid ${({ theme }) => theme.bg3 ?? '#2D3A47'};
    border-radius: 12px;
    color: ${({ theme }) => theme.text1 ?? '#FFFFFF'};
  }

  .react-datepicker__header {
    background: ${({ theme }) => theme.bg2 ?? '#192432'};
    border-bottom: 1px solid ${({ theme }) => theme.bg3 ?? '#2D3A47'};
    border-radius: 12px 12px 0 0;
    padding-top: 10px;
  }

  .react-datepicker__current-month,
  .react-datepicker__day-name {
    color: ${({ theme }) => theme.text1 ?? '#FFFFFF'};
  }

  .react-datepicker__day {
    color: ${({ theme }) => theme.text1 ?? '#FFFFFF'};
    border-radius: 6px;

    &:hover {
      background: ${({ theme }) => theme.bg3 ?? '#2D3A47'};
    }
  }

  .react-datepicker__day--selected {
    background: ${({ theme }) => theme.primary1 ?? '#2172E5'};
    color: white;

    &:hover {
      background: ${({ theme }) => theme.primary1 ?? '#2172E5'};
    }
  }

  .react-datepicker__day--keyboard-selected {
    background: ${({ theme }) => theme.primary1 ?? '#2172E5'}40;
    color: ${({ theme }) => theme.text1 ?? '#FFFFFF'};
  }

  .react-datepicker__day--outside-month {
    color: ${({ theme }) => theme.text3 ?? '#5C7285'};
  }

  .react-datepicker__navigation-icon::before {
    border-color: ${({ theme }) => theme.text2 ?? '#7E98A7'};
  }

  .react-datepicker__triangle {
    display: none;
  }
`

enum ChartView {
  VOL,
  PRICE,
  DENSITY,
  FEES,
}

export default function PoolPageWrapper() {
  const { address } = useParams<{ address: string }>()
  const { search } = useLocation()
  if (!address || !isAddress(address)) {
    return <Navigate to={{ pathname: '/', search }} replace />
  }
  return <PoolPage address={address} />
}

function PoolPage({ address }: { address: string }) {
  const [activeNetwork] = useActiveNetworkVersion()
  const { t } = useTranslation()
  const { search } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])
  const navigate = useNavigate()

  // theming
  const backgroundColor = useColor()
  const theme = useTheme()

  // token data
  const poolData = usePoolDatas([address])[0]
  const chartData = usePoolChartData(address)
  const transactions = usePoolTransactions(address)

  // date-fns locale 跟随系统语言
  const [dateLocale, setDateLocale] = useState(() => {
    const lang = i18n.language || 'en'
    if (lang.startsWith('zh')) {
      return lang.includes('TW') || lang.includes('HK') || lang.includes('MO') ? zhTW : zhCN
    }
    return enUS
  })

  useEffect(() => {
    const handleLangChange = (lng: string) => {
      if (lng.startsWith('zh')) {
        setDateLocale(lng.includes('TW') || lng.includes('HK') || lng.includes('MO') ? zhTW : zhCN)
      } else {
        setDateLocale(enUS)
      }
    }
    i18n.on('languageChanged', handleLangChange)
    return () => { i18n.off('languageChanged', handleLangChange) }
  }, [])

  const [view, setView] = useState(ChartView.VOL)
  const [latestValue, setLatestValue] = useState<number | undefined>()
  const [valueLabel, setValueLabel] = useState<string | undefined>()

  // 导出 Excel 相关状态
  const { dataClient } = useClients()
  const [dateStart, setDateStart] = useState<Date | null>(null)
  const [dateEnd, setDateEnd] = useState<Date | null>(null)
  const [exporting, setExporting] = useState(false)
  const [txFilter, setTxFilter] = useState<TransactionType | undefined>(undefined)

  const handleExportExcel = useCallback(async () => {
    setExporting(true)
    try {
      const startTimestamp = dateStart ? Math.floor(dateStart.getTime() / 1000) : undefined
      const endTimestamp = dateEnd ? Math.floor(dateEnd.getTime() / 1000) + 86400 - 1 : undefined

      const allTx = await fetchAllPoolTransactions(address, startTimestamp, endTimestamp, dataClient)

      // 按类型筛选
      const filteredTx = txFilter !== undefined
        ? allTx.filter((tx) => tx.type === txFilter)
        : allTx

      if (filteredTx.length === 0) {
        alert(t('noTransactionsInRange'))
        return
      }

      const descCol = t('description')
      const timeCol = t('time')
      const typeCol = t('type')
      const accountCol = t('account')
      const tokenAmtCol = t('tokenAmount')
      const totalValCol = t('totalValue')

      const token0Symbol = filteredTx[0].token0Symbol
      const token1Symbol = filteredTx[0].token1Symbol

      const exportData = filteredTx.map((tx) => {
        const d = new Date(parseInt(tx.timestamp) * 1000)
        const pad = (n: number) => String(n).padStart(2, '0')
        const outputTokenSymbol = tx.amountToken0 < 0 ? tx.token0Symbol : tx.token1Symbol
        const inputTokenSymbol = tx.amountToken1 < 0 ? tx.token0Symbol : tx.token1Symbol
        return {
          [descCol]: tx.type === TransactionType.MINT
            ? `Add ${token0Symbol} and ${token1Symbol}`
            : tx.type === TransactionType.SWAP
              ? `Swap ${inputTokenSymbol} for ${outputTokenSymbol}`
              : `Remove ${token0Symbol} and ${token1Symbol}`,
          [timeCol]: `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`,
          [typeCol]: tx.type === TransactionType.SWAP ? t('swaps') : tx.type === TransactionType.MINT ? t('adds') : t('removes'),
          [`${token0Symbol}(${tokenAmtCol})`]: Math.abs(tx.amountToken0),
          [`${token1Symbol}(${tokenAmtCol})`]: Math.abs(tx.amountToken1),
          [`USD(${totalValCol})`]: tx.amountUSD,
          'TxHash': tx.hash,
          [accountCol]: tx.sender,
        }
      })

      const ws = XLSX.utils.json_to_sheet(exportData)

      // 表头加粗
      const range = XLSX.utils.decode_range(ws['!ref']!)
      for (let C = range.s.c; C <= range.e.c; ++C) {
        const address = XLSX.utils.encode_col(C) + '1'
        if (!ws[address]) continue
        ws[address].s = {
          font: { bold: true },
        }
      }

      ws['!cols'] = [
        { wch: 36 },   // 描述
        { wch: 22 },   // 时间
        { wch: 8 },    // 类型
        { wch: 18 },   // Token0
        { wch: 18 },   // Token1
        { wch: 14 },   // USD
        { wch: 68 },   // TxHash
        { wch: 44 },   // 账户
      ]
      const wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, ws, t('transactions'))
      const pad = (n: number) => String(n).padStart(2, '0')
      const fmtDate = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
      const dateSuffix = dateStart && dateEnd
        ? `_${fmtDate(dateStart)}_${fmtDate(dateEnd)}`
        : '_all'
      XLSX.writeFile(wb, `pool_${token0Symbol}_${token1Symbol}${dateSuffix}.xlsx`)
    } catch (e) {
      console.error('导出失败:', e)
    } finally {
      setExporting(false)
    }
  }, [address, dateStart, dateEnd, dataClient, t, txFilter])

  const formattedTvlData = useMemo(() => {
    if (chartData) {
      return chartData.map((day) => {
        return {
          time: unixToDate(day.date),
          value: day.totalValueLockedUSD,
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

  const formattedFeesUSD = useMemo(() => {
    if (chartData) {
      return chartData.map((day) => {
        return {
          time: unixToDate(day.date),
          value: day.feesUSD,
        }
      })
    } else {
      return []
    }
  }, [chartData])

  //watchlist
  const [savedPools, addSavedPool] = useSavedPools()

  return (
    <Trace page={InterfacePageName.POOL_PAGE} shouldLogImpression>
      <PageWrapper style={{ paddingTop: '40px' }}>
        <ThemedBackground $backgroundColor={backgroundColor} />
        {poolData ? (
          <AutoColumn $gap="32px">
            <RowBetween>
              {/* <AutoRow $gap="4px">
                <StyledInternalLink to={networkPrefix(activeNetwork)}>
                  <TYPE.main>{`${t('home')} > `}</TYPE.main>
                </StyledInternalLink>
                <StyledInternalLink to={networkPrefix(activeNetwork) + 'pools'}>
                  <TYPE.label>{`${t('pools')} `}</TYPE.label>
                </StyledInternalLink>
                <TYPE.main>{` > `}</TYPE.main>
                <TYPE.label>{` ${poolData.token0.symbol} / ${poolData.token1.symbol} ${feeTierPercent(
                  poolData.feeTier,
                )} `}</TYPE.label>
              </AutoRow> */}
              <BackButton onClick={() => navigate(-1)}>
                <ArrowLeft />
                {t('back')}
              </BackButton>
              <RowFixed gap="10px" align="center">
                {/* <SavedIcon fill={savedPools.includes(address)} onClick={() => addSavedPool(address)} /> */}
                <StyledLink onClick={() => addSavedPool(address)}>
                  <img src={savedPools.includes(address) ? focusHtIcon : focusIcon}
                    alt="focusIcon" style={{ marginLeft: '14px', width: '40px', height: '40px' }} />
                </StyledLink>
                <StyledExternalLink href={getExplorerLink(ChainId.MAINNET, address, ExplorerDataType.ADDRESS)}>
                  {/* <ExternalLink stroke={theme?.text2} size={'17px'} style={{ marginLeft: '12px' }} /> */}
                  <img src={linkIcon} alt="linkIcon" style={{ marginLeft: '14px', width: '40px', height: '40px' }} />
                </StyledExternalLink>
              </RowFixed>
            </RowBetween>
            <ResponsiveRow align="flex-end">
              <AutoColumn $gap="lg">
                <RowFixed>
                  <DoubleCurrencyLogo address0={poolData.token0.address} address1={poolData.token1.address} size={24}
                   symbol0={poolData.token0.symbol} symbol1={poolData.token1.symbol} />
                  <TYPE.label
                    ml="8px"
                    mr="8px"
                    fontSize="24px"
                  >{` ${poolData.token0.symbol} / ${poolData.token1.symbol} `}</TYPE.label>
                  <GreyBadge>{feeTierPercent(poolData.feeTier)}</GreyBadge>
                  {activeNetwork === EthereumNetworkInfo ? null : (
                    <GenericImageWrapper src={activeNetwork.imageURL} style={{ marginLeft: '8px' }} size={'26px'} />
                  )}
                </RowFixed>
                <ResponsiveRow>
                  <StyledInternalLink to={toWithPreservedRouterSearch(`/tokens/${poolData.token0.address}`, search)}>
                    <TokenButton>
                      <RowFixed>
                        <CurrencyLogo address={poolData.token0.address} size={'20px'} symbol={poolData.token0.symbol} />
                        <TYPE.label fontSize="16px" ml="4px" style={{ whiteSpace: 'nowrap' }} width={'fit-content'}>
                          {`1 ${poolData.token0.symbol} =  ${formatAmount(poolData.token1Price, 4)} ${
                            poolData.token1.symbol
                          }`}
                        </TYPE.label>
                      </RowFixed>
                    </TokenButton>
                  </StyledInternalLink>
                  <StyledInternalLink to={toWithPreservedRouterSearch(`/tokens/${poolData.token1.address}`, search)}>
                    <TokenButton ml="10px">
                      <RowFixed>
                        <CurrencyLogo address={poolData.token1.address} size={'20px'} symbol={poolData.token1.symbol} />
                        <TYPE.label fontSize="16px" ml="4px" style={{ whiteSpace: 'nowrap' }} width={'fit-content'}>
                          {`1 ${poolData.token1.symbol} =  ${formatAmount(poolData.token0Price, 4)} ${
                            poolData.token0.symbol
                          }`}
                        </TYPE.label>
                      </RowFixed>
                    </TokenButton>
                  </StyledInternalLink>
                </ResponsiveRow>
              </AutoColumn>
              {/* {activeNetwork !== EthereumNetworkInfo ? null : (
                <RowFixed>
                  <StyledExternalLink
                    href={`https://app.uniswap.org/#/add/${poolData.token0.address}/${poolData.token1.address}/${poolData.feeTier}`}
                  >
                    <ButtonGray width="170px" mr="12px" style={{ height: '44px' }}>
                      <RowBetween>
                        <Download size={24} />
                        <div style={{ display: 'flex', alignItems: 'center' }}>Add Liquidity</div>
                      </RowBetween>
                    </ButtonGray>
                  </StyledExternalLink>
                  <StyledExternalLink
                    href={`https://app.uniswap.org/#/swap?inputCurrency=${poolData.token0.address}&outputCurrency=${poolData.token1.address}`}
                  >
                    <ButtonPrimary width="100px" style={{ height: '44px' }}>
                      Trade
                    </ButtonPrimary>
                  </StyledExternalLink>
                </RowFixed>
              )} */}
            </ResponsiveRow>
            <ContentLayout>
              <DarkGreyCard>
                <AutoColumn $gap="lg">
                  <GreyCard padding="16px">
                    <AutoColumn $gap="md">
                      <TYPE.main fontFamily="BarlowCondensed" fontWeight="400" fontSize="18px" lineHeight="22px">{t('totalTokensLocked')}</TYPE.main>
                      <RowBetween>
                        <RowFixed>
                          <CurrencyLogo address={poolData.token0.address} size={'20px'} symbol={poolData.token0.symbol} />
                          <TYPE.label fontSize="14px" ml="8px">
                            {poolData.token0.symbol}
                          </TYPE.label>
                        </RowFixed>
                        <TYPE.label fontSize="14px">{formatTokenAmount(poolData.tvlToken0)}</TYPE.label>
                      </RowBetween>
                      <RowBetween>
                        <RowFixed>
                          <CurrencyLogo address={poolData.token1.address} size={'20px'} symbol={poolData.token1.symbol} />
                          <TYPE.label fontSize="14px" ml="8px">
                            {poolData.token1.symbol}
                          </TYPE.label>
                        </RowFixed>
                        <TYPE.label fontSize="14px">{formatTokenAmount(poolData.tvlToken1)}</TYPE.label>
                      </RowBetween>
                    </AutoColumn>
                  </GreyCard>
                  <AutoColumn $gap="4px">
                    <TYPE.main fontWeight={400} fontFamily="BarlowCondensed" fontSize="18px" lineHeight="22px" color={'#7E98A7'}>{t('tvl')}</TYPE.main>
                    <TYPE.label fontSize="24px">{formatDollarAmount(poolData.tvlUSD)}</TYPE.label>
                    <Percent value={poolData.tvlUSDChange} />
                  </AutoColumn>
                  <AutoColumn $gap="4px">
                    <TYPE.main fontWeight={400} fontFamily="BarlowCondensed" fontSize="18px" lineHeight="22px" color={'#7E98A7'}>{t('volume24h')}</TYPE.main>
                    <TYPE.label fontSize="24px">{formatDollarAmount(poolData.volumeUSD)}</TYPE.label>
                    <Percent value={poolData.volumeUSDChange} />
                  </AutoColumn>
                  <AutoColumn $gap="4px">
                    <TYPE.main fontWeight={400} fontFamily="BarlowCondensed" fontSize="18px" lineHeight="22px" color={'#7E98A7'}>{t('fees24h')}</TYPE.main>
                    <TYPE.label fontSize="24px">
                      {/* {poolData.volumeUSD * (poolData.feeTier / 1000000)} */}
                      {formatDollarAmount(poolData.volumeUSD * (poolData.feeTier / 1000000))}
                    </TYPE.label>
                  </AutoColumn>
                </AutoColumn>
              </DarkGreyCard>
              <DarkGreyCard>
                <ToggleRow align="flex-start">
                  <AutoColumn>
                    <TYPE.label fontSize="24px" height="30px">
                      {/* @ts-ignore */}
                      <MonoSpace>
                        {latestValue !== undefined
                          ? formatDollarAmount(latestValue)
                          : view === ChartView.VOL
                            ? formatDollarAmount(formattedVolumeData[formattedVolumeData.length - 1]?.value)
                            : view === ChartView.FEES
                              ? formatDollarAmount(formattedFeesUSD[formattedFeesUSD.length - 1]?.value)
                            : view === ChartView.DENSITY
                              ? ''
                              : formatDollarAmount(formattedTvlData[formattedTvlData.length - 1]?.value)}{' '}
                      </MonoSpace>
                    </TYPE.label>
                    <TYPE.main height="20px" fontSize="12px">
                      {/* @ts-ignore */}
                      {valueLabel ? <MonoSpace>{valueLabel}</MonoSpace> : ''}
                    </TYPE.main>
                  </AutoColumn>
                  <ToggleWrapper width="240px">
                    <ToggleElementFree
                      isActive={view === ChartView.VOL}
                      fontSize="12px"
                      onClick={() => (view === ChartView.VOL ? setView(ChartView.DENSITY) : setView(ChartView.VOL))}
                    >
                      {t('volume')}
                    </ToggleElementFree>
                    <ToggleElementFree
                      isActive={view === ChartView.DENSITY}
                      fontSize="12px"
                      onClick={() => (view === ChartView.DENSITY ? setView(ChartView.VOL) : setView(ChartView.DENSITY))}
                    >
                      {t('liquidity')}
                    </ToggleElementFree>
                    <ToggleElementFree
                      isActive={view === ChartView.FEES}
                      fontSize="12px"
                      onClick={() => (view === ChartView.FEES ? setView(ChartView.VOL) : setView(ChartView.FEES))}
                    >
                      {t('fees')}
                    </ToggleElementFree>
                  </ToggleWrapper>
                </ToggleRow>
                {view === ChartView.VOL ? (
                  <BarChart
                    data={formattedVolumeData}
                    color={backgroundColor}
                    minHeight={340}
                    setValue={setLatestValue}
                    setLabel={setValueLabel}
                    value={latestValue}
                    label={valueLabel}
                  />
                ) : view === ChartView.FEES ? (
                  <BarChart
                    data={formattedFeesUSD}
                    color={backgroundColor}
                    minHeight={340}
                    setValue={setLatestValue}
                    setLabel={setValueLabel}
                    value={latestValue}
                    label={valueLabel}
                  />
                ) : (
                  <DensityChart address={address} />
                )}
              </DarkGreyCard>
            </ContentLayout>
            <TYPE.main fontSize="30px" fontFamily="BarlowCondensed" fontWeight="400" lineHeight="40px">{t('transactions')}</TYPE.main>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '12px', flexWrap: 'nowrap' }}>
              <StyledDatePickerWrapper>
                <DatePicker
                  selected={dateStart}
                  onChange={(date: Date | null) => setDateStart(date)}
                  selectsStart
                  startDate={dateStart}
                  endDate={dateEnd}
                  dateFormat="yyyy-MM-dd"
                  locale={dateLocale}
                  placeholderText={t('startDate')}
                  isClearable
                />
              </StyledDatePickerWrapper>
              <TYPE.main fontSize="14px" color="#7E98A7">—</TYPE.main>
              <StyledDatePickerWrapper>
                <DatePicker
                  selected={dateEnd}
                  onChange={(date: Date | null) => setDateEnd(date)}
                  selectsEnd
                  startDate={dateStart}
                  endDate={dateEnd}
                  minDate={dateStart ?? undefined}
                  dateFormat="yyyy-MM-dd"
                  locale={dateLocale}
                  placeholderText={t('endDate')}
                  isClearable
                />
              </StyledDatePickerWrapper>
              <ButtonPrimary
                onClick={handleExportExcel}
                disabled={exporting}
                width="auto"
                style={{ padding: '8px 16px', fontSize: '14px', whiteSpace: 'nowrap' }}
              >
                {exporting ? t('exporting') : t('exportExcel')}
              </ButtonPrimary>
            </div>
            <DarkGreyCard>
              {transactions ? <TransactionTable transactions={transactions} txFilter={txFilter} onFilterChange={setTxFilter} /> : <LocalLoader fill={false} />}
            </DarkGreyCard>
          </AutoColumn>
        ) : (
          <Loader />
        )}
      </PageWrapper>
    </Trace>
  )
}
