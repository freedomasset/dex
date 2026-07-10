import React, { Dispatch, SetStateAction, ReactNode, useEffect } from 'react'
import { BarChart, ResponsiveContainer, XAxis, Tooltip, Bar } from 'recharts'
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
import { VolumeWindow } from 'types'
import { LoadingRows } from 'components/Loader'
import { formatDollarAmount } from 'utils/numbers'
import { useTranslation } from 'react-i18next'
import i18n from '../../i18n'
dayjs.extend(utc)
dayjs.extend(localeData)

const DEFAULT_HEIGHT = 200

const Wrapper = styled(Card)`
  width: 100%;
  height: ${DEFAULT_HEIGHT}px;
  padding: 1rem 0;
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
      const data = payload[0]?.payload
      const rawValue = payload[0]?.value ?? data?.value
      const numericValue = Number(rawValue)
      const time = data?.time

      if (Number.isFinite(numericValue)) {
        setValue && setValue(numericValue)
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
    const data = payload[0]?.payload
    const rawValue = payload[0]?.value ?? data?.value
    const value = Number(rawValue)
    const time = data?.time

    return (
      <TooltipWrapper>
        <AutoColumn $gap="sm">
          {time && (
            <RowBetween>
              <TYPE.label color={'#ffffff'}>{t('timeLabel')} </TYPE.label>
              <TYPE.label>{formatDate(time)}</TYPE.label>
            </RowBetween>
          )}
          {Number.isFinite(value) && (
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

const CustomBar = ({
  x,
  y,
  width,
  height,
  fill,
}: {
  x: number
  y: number
  width: number
  height: number
  fill: string
}) => {
  if (isNaN(x) || isNaN(y) || isNaN(width) || isNaN(height)) {
    return null
  }
  return (
    <g>
      <rect x={x} y={y} fill={fill} width={width} height={height} rx="2" />
    </g>
  )
}

const Chart = ({
  data,
  color = '#33D3EB',
  setValue,
  setLabel,
  value,
  label,
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

  const now = dayjs()

  return (
    <Wrapper $minHeight={minHeight} {...rest}>
      <RowBetween style={{ alignItems: 'flex-start' }}>
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
          <BarChart
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
            <XAxis
              dataKey="time"
              axisLine={false}
              tickLine={false}
              tickFormatter={(time) => dayjs(time).format(activeWindow === VolumeWindow.monthly ? 'MMM' : 'DD')}
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
              cursor={{ fill: theme?.bg2, opacity: 0.1 }}
            />
            <Bar
              dataKey="value"
              fill={color}
              shape={(props: { height: number; width: number; x: number; y: number }) => {
                return <CustomBar height={props.height} width={props.width} x={props.x} y={props.y} fill={color} />
              }}
            />
          </BarChart>
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
