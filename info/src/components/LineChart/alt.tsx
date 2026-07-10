import React, { Dispatch, SetStateAction, ReactNode, useEffect } from 'react'
import { ResponsiveContainer, XAxis, Tooltip, AreaChart, Area } from 'recharts'
import styled from 'styled-components'
import Card, { LightCard } from 'components/Card'
import { RowBetween } from 'components/Row'
import { AutoColumn } from 'components/Column'
import { TYPE } from 'theme'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import localeData from 'dayjs/plugin/localeData'
import 'dayjs/locale/zh-cn'
import 'dayjs/locale/zh-tw'
import useTheme from 'hooks/useTheme'
import { darken } from 'polished'
import { LoadingRows } from 'components/Loader'
import { VolumeWindow } from 'types'
import { formatDollarAmount } from 'utils/numbers'
import { useTranslation } from 'react-i18next'
import i18n from '../../i18n'
dayjs.extend(utc)
dayjs.extend(localeData)

const DEFAULT_HEIGHT = 200

const Wrapper = styled(Card)`
  width: 100%;
  height: ${DEFAULT_HEIGHT}px;
  padding: 0 0 1rem 0;
  display: flex;
  background-color: ${({ theme }) => theme.bg0};
  flex-direction: column;
  > * {
    font-size: 1rem;
  }
`

export type LineChartProps = {
  data: any[]
  color?: string | undefined
  height?: number | undefined
  minHeight?: number
  setValue?: Dispatch<SetStateAction<number | undefined>> // used for value on hover
  setLabel?: Dispatch<SetStateAction<string | undefined>> // used for label of valye
  value?: number
  label?: string
  activeWindow?: VolumeWindow
  topLeft?: ReactNode | undefined
  topRight?: ReactNode | undefined
  bottomLeft?: ReactNode | undefined
  bottomRight?: ReactNode | undefined
} & React.HTMLAttributes<HTMLDivElement>

const TooltipWrapper = styled(LightCard)`
  padding: 12px;
  opacity: 0.9;
  font-size: 12px;
  z-index: 10;
  border: 1px solid ${({ theme }) => theme.bg3};
`

interface CustomTooltipProps {
  active?: boolean
  payload?: any[]
  setValue?: Dispatch<SetStateAction<number | undefined>>
  setLabel?: Dispatch<SetStateAction<string | undefined>>
  activeWindow?: VolumeWindow
}

const CustomTooltip = ({ active, payload, setValue, setLabel, activeWindow }: CustomTooltipProps) => {
  const theme = useTheme()
  const { t } = useTranslation()
  
  // 根据当前语言设置 dayjs locale
  const currentLanguage = (i18n as any).language || 'en'
  useEffect(() => {
    if (currentLanguage === 'zh-CN') {
      dayjs.locale('zh-cn')
    } else if (currentLanguage === 'zh-TW') {
      dayjs.locale('zh-tw')
    } else {
      dayjs.locale('en')
    }
  }, [currentLanguage])

  // 根据语言格式化日期
  const formatDate = (time: any) => {
    const currentLang = (i18n as any).language || 'en'
    if (currentLang === 'zh-CN' || currentLang === 'zh-TW') {
      return dayjs(time).format('YYYY年M月D日')
    }
    return dayjs(time).format('MMM D, YYYY')
  }

  useEffect(() => {
    if (active && payload && payload.length > 0) {
      const data = payload[0].payload
      const value = data?.value
      const time = data?.time

      if (value !== undefined) {
        setValue && setValue(value)
      }

      if (time) {
        const timeString = formatDate(time)
        setLabel && setLabel(timeString)
      }
    } else {
      setValue && setValue(undefined)
      setLabel && setLabel(undefined)
    }
  }, [active, payload, setValue, setLabel, activeWindow, currentLanguage])

  if (active && payload && payload.length > 0) {
    const data = payload[0].payload
    const value = data?.value
    const time = data?.time

    return (
      <TooltipWrapper>
        <AutoColumn $gap="sm">
          {time && (
            <RowBetween>
              <TYPE.label color={'#ffffff'}>{t('timeLabel')}</TYPE.label>
              <TYPE.label>{formatDate(time)}</TYPE.label>
            </RowBetween>
          )}
          {value !== undefined && (
            <RowBetween>
              <TYPE.label color={'#ffffff'}>{t('valueLabel')}</TYPE.label>
              <TYPE.label>{formatDollarAmount(value)}</TYPE.label>
            </RowBetween>
          )}
        </AutoColumn>
      </TooltipWrapper>
    )
  }

  return null
}

const Chart = ({
  data,
  color = '#33D3EB',
  value,
  label,
  setValue,
  setLabel,
  activeWindow,
  topLeft,
  topRight,
  bottomLeft,
  bottomRight,
  minHeight = DEFAULT_HEIGHT,
  ...rest
}: LineChartProps) => {
  const theme = useTheme()
  const parsedValue = value

  return (
    <Wrapper $minHeight={minHeight} {...rest}>
      <RowBetween>
        {topLeft ?? null}
        {topRight ?? null}
      </RowBetween>
      {data?.length === 0 ? (
        <LoadingRows>
          <div />
          <div />
          <div />
        </LoadingRows>
      ) : (
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            width={500}
            height={300}
            data={data}
            margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 5,
            }}
            onMouseLeave={() => {
              setLabel && setLabel(undefined)
              setValue && setValue(undefined)
            }}
          >
            <defs>
              <linearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={darken(0.36, color)} stopOpacity={0.5} />
                <stop offset="100%" stopColor={color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="time"
              axisLine={false}
              tickLine={false}
              tickFormatter={(time) => dayjs(time).format('DD')}
              minTickGap={10}
            />
            <Tooltip
              content={(props) => (
                <CustomTooltip
                  {...props}
                  setValue={setValue}
                  setLabel={setLabel}
                  activeWindow={activeWindow}
                />
              )}
              cursor={{ stroke: theme?.bg2, opacity: 0.1 }}
            />
            <Area dataKey="value" type="monotone" stroke={color} fill="url(#gradient)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      )}
      <RowBetween>
        {bottomLeft ?? null}
        {bottomRight ?? null}
      </RowBetween>
    </Wrapper>
  )
}

export default Chart
