import React, { useRef, useState, useEffect, useCallback, Dispatch, SetStateAction, ReactNode } from 'react'
import { createChart, IChartApi } from 'lightweight-charts'
import { RowBetween } from 'components/Row'
import Card from '../Card'
import styled from 'styled-components'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import useTheme from 'hooks/useTheme'

dayjs.extend(utc)

const Wrapper = styled(Card)`
  width: 100%;
  padding: 1rem;
  display: flex;
  background-color: ${({ theme }) => theme.bg0};
  flex-direction: column;
  > * {
    font-size: 1rem;
  }
`

const DEFAULT_HEIGHT = 200

export type LineChartProps = {
  data: any[]
  color?: string | undefined
  height?: number | undefined
  minHeight?: number
  setValue?: Dispatch<SetStateAction<number | undefined>> // used for value on hover
  setLabel?: Dispatch<SetStateAction<string | undefined>> // used for value label on hover
  topLeft?: ReactNode | undefined
  topRight?: ReactNode | undefined
  bottomLeft?: ReactNode | undefined
  bottomRight?: ReactNode | undefined
} & React.HTMLAttributes<HTMLDivElement>

const CandleChart = ({
  data,
  color = '#56B2A4',
  setValue,
  setLabel,
  topLeft,
  topRight,
  bottomLeft,
  bottomRight,
  height = DEFAULT_HEIGHT,
  minHeight = DEFAULT_HEIGHT,
  ...rest
}: LineChartProps) => {
  const theme = useTheme()
  const textColor = theme?.text3
  const chartRef = useRef<HTMLDivElement>(null)
  const [chartCreated, setChart] = useState<IChartApi | undefined>()
  const seriesRef = useRef<any>(null)
  const isInitializedRef = useRef<boolean>(false)

  const handleResize = useCallback(() => {
    if (chartCreated && chartRef?.current?.parentElement) {
      chartCreated.resize(chartRef.current.parentElement.clientWidth - 32, height)
      // Keep the zoomed out view instead of fitting all content
      chartCreated.timeScale().applyOptions({
        barSpacing: 3, // 保持较小的柱间距，显示更多数据点
      })
      chartCreated.timeScale().scrollToPosition(-1, false) // Scroll to latest data
    }
  }, [chartCreated, chartRef, height])

  // add event listener for resize
  const isClient = typeof window === 'object'
  useEffect(() => {
    if (!isClient) {
      return
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [isClient, chartRef, handleResize]) // Empty array ensures that effect is only run on mount and unmount

  // if chart not instantiated in canvas, create it (only once)
  useEffect(() => {
    // Prevent multiple chart creation
    if (isInitializedRef.current || !chartRef?.current?.parentElement) {
      return
    }

    // Only create chart if data is available
    if (!data || data.length === 0) {
      return
    }

    const chart = createChart(chartRef.current, {
      height: height,
      width: chartRef.current.parentElement.clientWidth - 32,
      layout: {
        backgroundColor: 'transparent',
        textColor: '#565A69',
        fontFamily: 'Inter var',
      },
      rightPriceScale: {
        scaleMargins: {
          top: 0.1,
          bottom: 0.1,
        },
        borderVisible: false,
      },
      timeScale: {
        borderVisible: false,
        secondsVisible: true,
        tickMarkFormatter: (unixTime: number) => {
          return dayjs.unix(unixTime).format('MM/DD h:mm A')
        },
      },
      watermark: {
        visible: false,
      },
      grid: {
        horzLines: {
          visible: false,
        },
        vertLines: {
          visible: false,
        },
      },
      crosshair: {
        horzLine: {
          visible: false,
          labelVisible: false,
        },
        mode: 1,
        vertLine: {
          visible: true,
          labelVisible: false,
          style: 3,
          width: 1,
          color: '#505050',
          labelBackgroundColor: color,
        },
      },
    })

    // Set initial zoom level to show more data (smaller view)
    // Use barSpacing to control initial zoom - larger value = more zoomed out
    chart.timeScale().applyOptions({
      barSpacing: 3, // 设置较小的柱间距，显示更多数据点
    })
    // Scroll to the end to show latest data
    chart.timeScale().scrollToPosition(-1, false)
    setChart(chart)
    isInitializedRef.current = true

    // Cleanup function to remove chart when component unmounts
    return () => {
      if (chart) {
        chart.remove()
        setChart(undefined)
        seriesRef.current = null
        isInitializedRef.current = false
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [color, height, data])

  // create series only once when chart is created
  useEffect(() => {
    if (chartCreated && !seriesRef.current) {
      const series = chartCreated.addCandlestickSeries({
        upColor: 'green',
        downColor: 'red',
        borderDownColor: 'red',
        borderUpColor: 'green',
        wickDownColor: 'red',
        wickUpColor: 'green',
      })

      seriesRef.current = series

      // update the title when hovering on the chart (subscribe only once)
      chartCreated.subscribeCrosshairMove(function (param) {
        if (
          chartRef?.current &&
          (param === undefined ||
            param.time === undefined ||
            (param && param.point && param.point.x < 0) ||
            (param && param.point && param.point.x > chartRef.current.clientWidth) ||
            (param && param.point && param.point.y < 0) ||
            (param && param.point && param.point.y > height))
        ) {
          // reset values
          setValue && setValue(undefined)
          setLabel && setLabel(undefined)
        } else if (series && param) {
          const timestamp = param.time as number
          const time = dayjs.unix(timestamp).utc().format('MMM D, YYYY h:mm A')
          const parsed = param.seriesPrices.get(series) as { open: number } | undefined
          setValue && setValue(parsed?.open)
          setLabel && setLabel(time)
        }
      })
    }

    // Cleanup function to remove series when component unmounts
    return () => {
      if (chartCreated && seriesRef.current) {
        chartCreated.removeSeries(seriesRef.current)
        seriesRef.current = null
      }
    }
  }, [chartCreated, height, setValue, setLabel])

  // update data when it changes (only if series already exists)
  useEffect(() => {
    if (seriesRef.current && data && data.length > 0 && chartCreated) {
      seriesRef.current.setData(data)
      // Keep the zoomed out view instead of fitting all content
      chartCreated.timeScale().applyOptions({
        barSpacing: 3, // 保持较小的柱间距，显示更多数据点
      })
      chartCreated.timeScale().scrollToPosition(-1, false) // Scroll to latest data
    }
  }, [data, chartCreated])

  return (
    <Wrapper $minHeight={minHeight}>
      <RowBetween>
        {topLeft ?? null}
        {topRight ?? null}
      </RowBetween>
      <div ref={chartRef} id={'candle-chart'} {...rest} />
      <RowBetween>
        {bottomLeft ?? null}
        {bottomRight ?? null}
      </RowBetween>
    </Wrapper>
  )
}

export default CandleChart
