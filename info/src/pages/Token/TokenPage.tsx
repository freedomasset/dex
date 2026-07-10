import React, { useMemo, useState, useEffect, useRef, useCallback } from 'react'
import {
  useTokenData,
  usePoolsForToken,
  useTokenChartData,
  useTokenPriceData,
  useTokenTransactions,
} from 'state/tokens/hooks'
import styled from 'styled-components'
import { useColor } from 'hooks/useColor'
import { ThemedBackground, PageWrapper } from 'pages/styled'
import { shortenAddress, getExplorerLink, currentTimestamp, ExplorerDataType } from 'utils'
import { AutoColumn } from 'components/Column'
import { RowBetween, RowFixed, AutoRow, RowFlat } from 'components/Row'
import { TYPE, StyledInternalLink } from 'theme'
import Loader, { LocalLoader } from 'components/Loader'
import { ExternalLink, Download, X } from 'react-feather'
import { ExternalLink as StyledExternalLink } from '../../theme/components'
import useTheme from 'hooks/useTheme'
import CurrencyLogo from 'components/CurrencyLogo'
import { formatDollarAmount } from 'utils/numbers'
import Percent from 'components/Percent'
import { ButtonPrimary, ButtonGray, SavedIcon } from 'components/Button'
import { DarkGreyCard, DarkGreyCardNoPadding, LightGreyCard } from 'components/Card'
import { usePoolDatas } from 'state/pools/hooks'
import PoolTable from 'components/pools/PoolTable'
import LineChart from 'components/LineChart/alt'
import { unixToDate } from 'utils/date'
import { ToggleWrapper, ToggleElementFree } from 'components/Toggle/index'
import BarChart from 'components/BarChart/alt'
import CandleChart from 'components/CandleChart'
import TransactionTable from 'components/TransactionsTable'
import { useSavedTokens } from 'state/user/hooks'
import { ONE_HOUR_SECONDS, TimeWindow } from 'constants/intervals'
import { MonoSpace } from 'components/shared'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import localeData from 'dayjs/plugin/localeData'
import 'dayjs/locale/zh-cn'
import 'dayjs/locale/zh-tw'
import { useActiveNetworkVersion } from 'state/application/hooks'
import { getDexBaseUrl, getSwapChainParamFromChainId } from 'utils/getNetworkByEnv'
dayjs.extend(utc)
dayjs.extend(localeData)
import { EthereumNetworkInfo } from 'constants/networks'
import { GenericImageWrapper } from 'components/Logo'
import { useCMCLink } from 'hooks/useCMCLink'
import CMCLogo from '../../assets/images/cmc.png'
import linkIcon from '../../assets/images/simpleFlow/link.png'
import focusIcon from '../../assets/images/simpleFlow/focus.png'
import focusHtIcon from '../../assets/images/simpleFlow/focusHt.png'
import { useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import i18n from '../../i18n'
import { Trace } from '@uniswap/analytics'
import { ChainId, SUPPORTED_CHAINS } from '@vanadex/sdk-core'
import Modal from 'components/Modal'
import TokenDescription from 'components/TokenDescription'
import { ArrowLeft } from 'react-feather'


const PriceText = styled(TYPE.label)`
  font-size: 36px;
  line-height: 0.8;
`

const ContentLayout = styled.div`
  margin-top: 16px;
  display: grid;
  grid-template-columns: 260px 1fr;
  grid-gap: 1em;

  @media screen and (max-width: 800px) {
    grid-template-columns: 1fr;
    grid-template-rows: 1fr 1fr;
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

const StyledCMCLogo = styled.img`
  height: 16px;
  display: flex;
  justify-content: center;
  align-items: center;
`

const DexScreenerIframe = styled.iframe`
  width: 100%;
  height: 300px;
  border: none;
  border-radius: 8px;
  background: ${({ theme }) => theme.bg1};
`

const SectionHeader = styled(RowBetween)`
  align-items: center;
  margin-bottom: 16px;
`

const SmallToggleWrapper = styled(ToggleWrapper)`
  width: 120px;
`

const TradeModalContent = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
`

const BoxContainerCard = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  background: #0D0D0D;
  border-radius: 18px;
  border: 1px solid #3A3A3A;
`

const StatItem = styled.div`
  flex: 1;
  padding: 24px 45px;
  position: relative;
  
  &:not(:last-child)::after {
    content: '';
    position: absolute;
    right: 0;
    top: 50%;
    transform: translateY(-50%);
    width: 1px;
    height: 87px;
    background-color: #2C2C2C;
  }
`

const TradeIframe = styled.iframe`
  width: 100%;
  height: 600px;
  border: none;
  min-height: 560px;
  background: ${({ theme }) => theme.bg1};
  flex: 1;
`

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 20px 16px 20px;
`

const HeaderIcons = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
`

const IconButton = styled.button`
  background: none;
  border: none;
  color: ${({ theme }) => theme.text2};
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    color: ${({ theme }) => theme.text1};
    background: ${({ theme }) => theme.bg2};
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
const ExternalLinkIcon = styled.a`
  color: ${({ theme }) => theme.text2};
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    color: ${({ theme }) => theme.text1};
    background: ${({ theme }) => theme.bg2};
  }
`

enum ChartView {
  TVL,
  VOL,
  PRICE,
}

enum ChartSource {
  NATIVE,
  DEXSCREENER,
}

enum TransactionSource {
  DEXSCREENER,
  NATIVE,
}

const DEFAULT_TIME_WINDOW = TimeWindow.WEEK

export default function TokenPage() {
  const [activeNetwork] = useActiveNetworkVersion()
  const { address } = useParams<{ address?: string }>()
  const navigate = useNavigate()
  const { t } = useTranslation()

  const formattedAddress = address?.toLowerCase() ?? ''
  // theming
  const backgroundColor = useColor(formattedAddress)
  const theme = useTheme()

  // scroll on page view
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  const tokenData = useTokenData(formattedAddress)
  const poolsForToken = usePoolsForToken(formattedAddress)
  const poolDatas = usePoolDatas(poolsForToken ?? [])
  const transactions = useTokenTransactions(formattedAddress)
  const chartData = useTokenChartData(formattedAddress)

  //const { tokenAddress } = useParams<{ tokenAddress: string }>()
  const tokenAddress = formattedAddress


  // check for link to CMC
  const cmcLink = useCMCLink(formattedAddress)

  // format for chart component
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

  // chart labels
  const [view, setView] = useState(ChartView.VOL)
  const [latestValue, setLatestValue] = useState<number | undefined>()
  const [valueLabel, setValueLabel] = useState<string | undefined>()
  const [timeWindow] = useState(DEFAULT_TIME_WINDOW)

  // 获取当前语言（用于日期格式化）
  const currentLanguageForDate = (i18n as any).language || 'en'

  // 根据当前语言格式化日期
  const formatCurrentDate = useMemo(() => {
    if (currentLanguageForDate === 'zh-CN') {
      dayjs.locale('zh-cn')
      return dayjs.utc().format('YYYY年M月D日')
    } else if (currentLanguageForDate === 'zh-TW') {
      dayjs.locale('zh-tw')
      return dayjs.utc().format('YYYY年M月D日')
    } else {
      dayjs.locale('en')
      return dayjs.utc().format('MMM D, YYYY')
    }
  }, [currentLanguageForDate])

  // source toggles
  const [chartSource, setChartSource] = useState(ChartSource.DEXSCREENER)
  const [transactionSource, setTransactionSource] = useState(TransactionSource.DEXSCREENER)

  // trade modal state
  const [showTradeModal, setShowTradeModal] = useState(false)
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const chainBoxProviderRef = useRef<{ info: any; provider: any } | null>(null)
  // 存储事件监听器，用于清理
  const eventHandlersRef = useRef<Map<string, Map<string, (data: any) => void>>>(new Map())

  // 监听 EIP-6963 事件，收集 ChainBox provider
  useEffect(() => {
    const handleAnnounceProvider = (event: Event) => {
      const customEvent = event as CustomEvent
      const { info, provider } = customEvent.detail

      // 检查是否是 ChainBox provider
      if (info.name.toLowerCase().includes('chainbox') || provider?.isChainBox) {
        console.log('[ChainBox parent] 检测到 ChainBox provider:', info, provider)
        chainBoxProviderRef.current = { info, provider }
        
        // 自动设置 provider 事件监听，将事件转发到 iframe
        setupProviderEventListeners(provider)
      }
    }

    window.addEventListener('eip6963:announceProvider', handleAnnounceProvider)
    
    // 请求提供者
    window.dispatchEvent(new Event('eip6963:requestProvider'))

    return () => {
      window.removeEventListener('eip6963:announceProvider', handleAnnounceProvider)
    }
  }, [])

  // 设置 provider 事件监听，自动转发事件到 iframe
  const setupProviderEventListeners = useCallback((provider: any) => {
    if (!provider) return

    const eventHandlers = eventHandlersRef.current
    const commonEvents = ['connect', 'disconnect', 'chainChanged', 'accountsChanged']

    commonEvents.forEach((eventName) => {
      // 如果已经设置过，先移除
      const existingHandlers = eventHandlers.get(eventName)
      if (existingHandlers) {
        existingHandlers.forEach((handler) => {
          try {
            provider.removeListener(eventName, handler)
          } catch (e) {
            // Ignore
          }
        })
        existingHandlers.clear()
      }

      // 创建新的事件处理器
      const handler = (eventData: any) => {
        const iframe = iframeRef.current
        if (!iframe || !iframe.contentWindow) return

        // 获取 targetOrigin
        let targetOrigin = '*'
        try {
          if (iframe.src) {
            const url = new URL(iframe.src)
            targetOrigin = url.origin
          }
        } catch (e) {
          // 使用 '*' 作为后备
        }

        // 转发事件到 iframe
        iframe.contentWindow.postMessage(
          {
            type: 'chainbox:event', // iframe 端期望的格式
            source: 'chainbox-parent',
            eventName, // iframe 端期望的字段名
            data: eventData,
          },
          targetOrigin
        )
      }

      // 存储处理器
      if (!eventHandlers.has(eventName)) {
        eventHandlers.set(eventName, new Map())
      }
      eventHandlers.get(eventName)!.set('auto', handler)

      // 设置监听器
      try {
        provider.on(eventName, handler)
        console.log(`[ChainBox parent] 已设置自动事件监听: ${eventName}`)
      } catch (error) {
        console.error(`[ChainBox parent] 设置事件监听失败: ${eventName}`, error)
      }
    })
  }, [])

  // 发送 ChainBox provider 信息给 iframe
  const sendChainBoxProviderToIframe = useCallback(() => {
    const iframe = iframeRef.current
    if (!iframe || !iframe.contentWindow || !chainBoxProviderRef.current) {
      return
    }

    try {
      const { info } = chainBoxProviderRef.current
      
      // 从 iframe src 中提取 origin，用于跨域 postMessage
      // 如果无法提取，则使用 '*'（允许所有源，但安全性较低）
      let targetOrigin = '*'
      try {
        if (iframe.src) {
          const url = new URL(iframe.src)
          targetOrigin = url.origin
        }
      } catch (e) {
        // 如果 URL 解析失败，使用 '*' 作为后备
        console.warn('Failed to parse iframe URL, using wildcard origin:', e)
      }

      // postMessage 支持跨域通信
      // 注意：只能传递可序列化的数据（JSON），provider 对象无法直接传递
      // provider 对象包含函数和不可序列化的内容，会导致 DataCloneError
      // 因此只传递 info 元数据，并通过 postMessage 代理机制让 iframe 调用 provider 方法
      iframe.contentWindow.postMessage(
        {
          type: 'eip6963:announceProvider',
          source: 'chainbox-parent',
          detail: {
            info: {
              uuid: info.uuid,
              name: info.name,
              icon: info.icon,
              rdns: info.rdns,
            },
            // 标记：告诉 iframe 可以通过 postMessage 代理调用 provider 方法
            proxyAvailable: true,
            // 注意：provider 对象无法通过 postMessage 传递
            // iframe 需要通过 postMessage 发送 'chainbox:provider:request' 消息来调用 provider 方法
          },
        },
        targetOrigin // 使用具体的 origin 提高安全性
      )
    } catch (error) {
      console.error('Failed to send ChainBox provider to iframe:', error)
    }
  }, [])

  // 监听来自 iframe 的消息（包括 EIP-6963 请求和 provider 方法调用）
  useEffect(() => {
    // 保存 ref 的引用，用于清理函数
    const eventHandlers = eventHandlersRef.current
    
    const handleMessage = (event: MessageEvent) => {
      // 验证消息来源（可选，提高安全性）
      // if (event.origin !== 'https://test-dex.shuqinkeji.cn') return

      const data = event.data
      const iframe = iframeRef.current

      if (!iframe || !chainBoxProviderRef.current) {
        return
      }

      // 处理来自 iframe 的 provider 请求
      if (data && (
        (data.type === 'eip6963:requestProvider' && (data.source === 'chainbox-connector' || data.source === 'chainbox-iframe')) ||
        (data.type === 'chainbox:requestProvider' && data.source === 'chainbox-iframe')
      )) {
        // iframe 主动请求 provider，立即发送
        sendChainBoxProviderToIframe()
      }

      // 处理来自 iframe 的 provider 方法调用请求
      // 支持两种消息格式：
      // 1. chainbox:provider:request (source: chainbox-connector) - 包含 method, params, requestId
      // 2. chainbox:request (source: chainbox-iframe) - 包含 params, requestId，method 在 params 中或需要从 params 提取
      if (data && (
        (data.type === 'chainbox:provider:request' && data.source === 'chainbox-connector') ||
        (data.type === 'chainbox:request' && data.source === 'chainbox-iframe')
      )) {
        // 兼容两种格式
        let method: string
        let params: any
        let requestId: string
        
        if (data.type === 'chainbox:request') {
          // iframe 端格式：params 是 { method: string, params?: any[] } 格式
          requestId = data.requestId
          const requestParams = data.params
          
          // 从 params 对象中提取 method 和 params 数组
          if (requestParams && typeof requestParams === 'object' && requestParams.method) {
            method = requestParams.method
            // params 数组在 requestParams.params 中
            params = requestParams.params || []
          } else {
            // 兼容其他格式
            method = data.method || 'eth_requestAccounts'
            params = requestParams || []
          }
        } else {
          // 原有格式
          method = data.method
          params = data.params
          requestId = data.requestId
        }
        
        const { provider } = chainBoxProviderRef.current

        if (!provider) {
          // 发送错误响应 - 使用 iframe 端期望的格式
          let targetOrigin = '*'
          try {
            if (data.iframeOrigin) {
              targetOrigin = data.iframeOrigin
            } else if (iframe.src) {
              const url = new URL(iframe.src)
              targetOrigin = url.origin
            }
          } catch (e) {
            // 使用 '*' 作为后备
          }
          
          iframe.contentWindow?.postMessage(
            {
              type: 'chainbox:response', // iframe 端期望的格式
              source: 'chainbox-parent',
              requestId,
              error: 'Provider not available',
            },
            targetOrigin
          )
          return
        }

        // 获取 targetOrigin - 优先使用 iframe 端提供的 origin
        let targetOrigin = '*'
        try {
          if (data.iframeOrigin) {
            // 使用 iframe 端提供的 origin（更安全）
            targetOrigin = data.iframeOrigin
          } else if (iframe.src) {
            const url = new URL(iframe.src)
            targetOrigin = url.origin
          }
        } catch (e) {
          // 使用 '*' 作为后备
        }

        // 调用 provider 方法
        Promise.resolve()
          .then(() => {
            // 统一使用 provider.request 调用，支持所有 EIP-1193 方法
            // params 应该是数组格式（EIP-1193 规范）
            const requestParams = Array.isArray(params) ? params : (params ? [params] : [])
            return provider.request({ method, params: requestParams })
          })
          .then((result) => {
            // 发送成功响应 - 使用 iframe 端期望的格式
            iframe.contentWindow?.postMessage(
              {
                type: 'chainbox:response', // iframe 端期望的格式
                source: 'chainbox-parent',
                requestId,
                result,
              },
              targetOrigin
            )
          })
          .catch((error) => {
            // 发送错误响应 - 使用 iframe 端期望的格式
            iframe.contentWindow?.postMessage(
              {
                type: 'chainbox:response', // iframe 端期望的格式
                source: 'chainbox-parent',
                requestId,
                error: error?.message || 'Unknown error', // iframe 端期望 error 是字符串
              },
              targetOrigin
            )
          })
      }

      // 处理来自 iframe 的 provider 事件监听请求
      if (data && data.type === 'chainbox:provider:on' && (data.source === 'chainbox-connector' || data.source === 'chainbox-iframe')) {
        const { event, requestId } = data
        const { provider } = chainBoxProviderRef.current

        if (!provider) {
          // 发送错误响应
          iframe.contentWindow?.postMessage(
            {
              type: 'chainbox:provider:on:response',
              source: 'chainbox-parent',
              requestId,
              success: false,
              error: 'Provider not available',
            },
            '*'
          )
          return
        }

        try {
          // 设置事件监听器
          const handler = (eventData: any) => {
            // 获取 targetOrigin
            let targetOrigin = '*'
            try {
              if (iframe.src) {
                const url = new URL(iframe.src)
                targetOrigin = url.origin
              }
            } catch (e) {
              // 使用 '*' 作为后备
            }

            iframe.contentWindow?.postMessage(
              {
                type: 'chainbox:event', // iframe 端期望的格式
                source: 'chainbox-parent',
                eventName: event, // iframe 端期望的字段名
                data: eventData,
              },
              targetOrigin
            )
          }

          // 存储事件监听器，用于后续清理
          if (!eventHandlers.has(event)) {
            eventHandlers.set(event, new Map())
          }
          eventHandlers.get(event)!.set(requestId, handler)

          provider.on(event, handler)

          // 发送确认消息
          let targetOrigin = '*'
          try {
            if (iframe.src) {
              const url = new URL(iframe.src)
              targetOrigin = url.origin
            }
          } catch (e) {
            // 使用 '*' 作为后备
          }

          iframe.contentWindow?.postMessage(
            {
              type: 'chainbox:provider:on:response',
              source: 'chainbox-parent',
              requestId,
              success: true,
            },
            targetOrigin
          )
        } catch (error) {
          // 发送错误响应
          iframe.contentWindow?.postMessage(
            {
              type: 'chainbox:provider:on:response',
              source: 'chainbox-parent',
              requestId,
              success: false,
              error: error?.message || 'Failed to set up event listener',
            },
            '*'
          )
        }
      }

      // 处理来自 iframe 的移除事件监听请求
      if (data && data.type === 'chainbox:provider:removeListener' && (data.source === 'chainbox-connector' || data.source === 'chainbox-iframe')) {
        const { event, requestId } = data
        const { provider } = chainBoxProviderRef.current

        if (!provider) {
          return
        }

        try {
          // 获取并移除事件监听器
          const eventHandlerMap = eventHandlers.get(event)
          if (eventHandlerMap) {
            const handler = eventHandlerMap.get(requestId)
            if (handler) {
              provider.removeListener(event, handler)
              eventHandlerMap.delete(requestId)
              
              // 如果没有监听器了，清理事件映射
              if (eventHandlerMap.size === 0) {
                eventHandlers.delete(event)
              }
            }
          }
        } catch (error) {
          console.error('Failed to remove event listener:', error)
        }
      }
    }

    window.addEventListener('message', handleMessage)

    return () => {
      window.removeEventListener('message', handleMessage)
      
      // 清理所有事件监听器
      const currentProvider = chainBoxProviderRef.current?.provider
      
      if (currentProvider) {
        eventHandlers.forEach((handlers, event) => {
          handlers.forEach((handler) => {
            try {
              currentProvider.removeListener(event, handler)
            } catch (error) {
              console.error('Failed to remove event listener on cleanup:', error)
            }
          })
        })
        eventHandlers.clear()
      }
    }
  }, [sendChainBoxProviderToIframe])

  // 当 Modal 打开时，主动发送 ChainBox provider 信息
  useEffect(() => {
    if (!showTradeModal) {
      return undefined
    }

    // 先请求一次提供者，确保获取最新的
    window.dispatchEvent(new Event('eip6963:requestProvider'))
    
    // 等待一小段时间让提供者被检测到，然后发送
    const timer = setTimeout(() => {
      if (iframeRef.current?.contentWindow && chainBoxProviderRef.current) {
        sendChainBoxProviderToIframe()
      }
    }, 200)

    return () => {
      clearTimeout(timer)
    }
  }, [showTradeModal, sendChainBoxProviderToIframe])

  // pricing data
  const priceData = useTokenPriceData(formattedAddress, ONE_HOUR_SECONDS, timeWindow)
  const adjustedToCurrent = useMemo(() => {
    if (priceData && tokenData && priceData.length > 0) {
      const adjusted = Object.assign([], priceData)
      adjusted.push({
        time: currentTimestamp() / 1000,
        open: priceData[priceData.length - 1].close,
        close: tokenData?.priceUSD,
        high: tokenData?.priceUSD,
        low: priceData[priceData.length - 1].close,
      })
      return adjusted
    } else {
      return undefined
    }
  }, [priceData, tokenData])

  // watchlist
  const [savedTokens, addSavedToken] = useSavedTokens()

  // DexScreener URLs
  const dexscreenerChartUrl = `https://dexscreener.com/vana/${formattedAddress}?embed=1&theme=dark&trades=0&info=0`
  const dexscreenerTransactionsUrl = `https://dexscreener.com/vana/${formattedAddress}?embed=1&theme=dark&chart=0&info=0`

  // Trade URLs - 获取当前语言并添加到 URL
  // 语言代码映射：en -> en-US, zh-CN -> zh-CN, zh-TW -> zh-TW
  const i18nLanguage = (i18n as any).language || 'en'
  const getLanguageCode = useMemo(() => {
    const lang = i18nLanguage
    if (lang === 'en' || lang.startsWith('en')) {
      return 'en-US'
    }
    if (lang === 'zh-CN' || (lang.startsWith('zh') && !lang.includes('TW') && !lang.includes('HK') && !lang.includes('MO'))) {
      return 'zh-CN'
    }
    if (lang === 'zh-TW' || lang.includes('TW') || lang.includes('HK') || lang.includes('MO')) {
      return 'zh-TW'
    }
    return 'en-US' // 默认返回英文
  }, [i18nLanguage])
  
  const currentLanguage = getLanguageCode
  
  // 根据主网/测试网添加 chain 参数
  // 主网：tt-chain -> tt_chain，测试网：tt-chain-testnet -> tt_chain_testnet
  const chainParam = getSwapChainParamFromChainId(activeNetwork.chainId)
  const dexBaseUrl = getDexBaseUrl()
  const swapIframeUrl = `${dexBaseUrl}/#/swap?outputCurrency=${formattedAddress}&lng=${currentLanguage}&chain=${chainParam}&isIframe=true`
  const directSwapUrl = `${dexBaseUrl}/#/swap?outputCurrency=${formattedAddress}&lng=${currentLanguage}&chain=${chainParam}`

  return (
    <Trace page="token-page" shouldLogImpression>
      <PageWrapper style={{ paddingTop: '40px' }}>
        {tokenData ? (
          !tokenData.exists ? (
            <LightGreyCard style={{ textAlign: 'center' }}>
              No pool has been created with this token yet. Create one
              <StyledExternalLink
                style={{ marginLeft: '4px' }}
                href={`${dexBaseUrl}/#/add/${formattedAddress}`}
              >
                here.
              </StyledExternalLink>
            </LightGreyCard>
          ) : (
            <AutoColumn $gap="24px">
              <AutoColumn $gap="24px">
                <RowBetween>
                  {/* <AutoRow $gap="4px">
                    <StyledInternalLink to="/">
                      <TYPE.main>{`Home > `}</TYPE.main>
                    </StyledInternalLink>
                    <StyledInternalLink to="/tokens">
                      <TYPE.label>{` Tokens `}</TYPE.label>
                    </StyledInternalLink>
                    <TYPE.main>{` > `}</TYPE.main>
                    <TYPE.label>{` ${tokenData.symbol} `}</TYPE.label>
                    <StyledExternalLink
                      href={getExplorerLink(activeNetwork.chainId, formattedAddress, ExplorerDataType.ADDRESS)}
                    >
                      <TYPE.main>{` (${shortenAddress(formattedAddress)}) `}</TYPE.main>
                    </StyledExternalLink>
                  </AutoRow> */}
                  <BackButton onClick={() => navigate(-1)}>
                    <ArrowLeft />
                    {t('back')}
                  </BackButton>
                  <RowFixed align="center" justify="center">
                    {/* <SavedIcon
                      fill={savedTokens.includes(formattedAddress)}
                      onClick={() => addSavedToken(formattedAddress)}
                    /> */}
                    <StyledLink onClick={() => addSavedToken(formattedAddress)}>
                      <img src={savedTokens.includes(formattedAddress) ? focusHtIcon : focusIcon}
                        alt="focusIcon" style={{ marginLeft: '14px', width: '40px', height: '40px' }} />
                    </StyledLink>
                    {/* {cmcLink && (
                      <StyledExternalLink href={cmcLink} style={{ marginLeft: '12px' }}>
                        <StyledCMCLogo src={linkIcon} />
                      </StyledExternalLink>
                    )} */}
                    <StyledExternalLink
                      href={getExplorerLink(activeNetwork.chainId, formattedAddress, ExplorerDataType.ADDRESS)}
                    >
                      {/* <ExternalLink stroke={theme?.text2} size={'17px'} style={{ marginLeft: '12px' }} /> */}
                      <img src={linkIcon} alt="linkIcon" style={{ marginLeft: '14px', width: '40px', height: '40px' }} />
                    </StyledExternalLink>
                  </RowFixed>
                </RowBetween>
                <ResponsiveRow align="flex-end">
                  <AutoColumn $gap="md">
                    <RowFixed gap="lg">
                      <CurrencyLogo address={formattedAddress} symbol={tokenData.symbol} />
                      <TYPE.label ml={'10px'} fontSize="20px">
                        {tokenData.name}
                      </TYPE.label>
                      <TYPE.main ml={'6px'} fontSize="20px">
                        ({tokenData.symbol})
                      </TYPE.main>
                      {/* {activeNetwork === EthereumNetworkInfo ? null : (
                        <GenericImageWrapper src={activeNetwork.imageURL} style={{ marginLeft: '8px' }} size={'26px'} />
                      )} */}
                    </RowFixed>
                    <RowFlat style={{ marginTop: '8px', marginLeft: '26px', display: 'flex', alignItems: 'center' }}>
                      <PriceText mr="18px" fontWeight={400} fontSize="42px" fontFamily="BarlowCondensed" lineHeight="50px"> {formatDollarAmount(tokenData.priceUSD)}</PriceText>
                      <Percent value={tokenData.priceUSDChange} box={true} />
                    </RowFlat>
                  </AutoColumn>
                  {/* {activeNetwork !== EthereumNetworkInfo ? null : (
                    <RowFixed>
                      <StyledExternalLink href={`https://app.uniswap.org/#/add/${formattedAddress}`}>
                        <ButtonGray width="170px" mr="12px" height={'100%'} style={{ height: '44px' }}>
                          <RowBetween>
                            <Download size={24} />
                            <div style={{ display: 'flex', alignItems: 'center' }}>Add Liquidity</div>
                          </RowBetween>
                        </ButtonGray>
                      </StyledExternalLink>
                      <StyledExternalLink href={`https://app.uniswap.org/#/swap?inputCurrency=${formattedAddress}`}>
                        <ButtonPrimary width="100px" bgColor={backgroundColor} style={{ height: '44px' }}>
                          Trade
                        </ButtonPrimary>
                      </StyledExternalLink>
                    </RowFixed>
                  )} */}
                </ResponsiveRow>
              </AutoColumn>
              <DarkGreyCard style={{ display: "flex", padding: 0 }}>
                <StatItem>
                  <AutoColumn $gap="4px">
                    <TYPE.main fontWeight={400} color={'#7E98A7'} fontSize="18px" mb="15px" fontFamily="BarlowCondensed" lineHeight="22px">{t('tvl')}</TYPE.main>
                    <TYPE.label fontSize="28px" fontFamily="BarlowCondensed" lineHeight="34px">{formatDollarAmount(tokenData.tvlUSD)}</TYPE.label>
                    <Percent fontWeight={400} fontSize="14px" value={tokenData.tvlUSDChange} />
                  </AutoColumn>
                </StatItem>
                <StatItem>
                  <AutoColumn $gap="4px">
                    <TYPE.main fontWeight={400} color={'#7E98A7'} fontSize="18px" mb="15px" fontFamily="BarlowCondensed" lineHeight="22px">{t('volume24h')}</TYPE.main>
                    <TYPE.label fontSize="28px" fontFamily="BarlowCondensed" lineHeight="34px">{formatDollarAmount(tokenData.volumeUSD)}</TYPE.label>
                    <Percent fontWeight={400} fontSize="14px" value={tokenData.volumeUSDChange} />
                  </AutoColumn>
                </StatItem>
                <StatItem>
                  <AutoColumn $gap="4px">
                    <TYPE.main fontWeight={400} color={'#7E98A7'} fontSize="18px" mb="15px" fontFamily="BarlowCondensed" lineHeight="22px">{t('volume7d')}</TYPE.main>
                    <TYPE.label fontSize="28px" fontFamily="BarlowCondensed" lineHeight="34px">{formatDollarAmount(tokenData.volumeUSDWeek)}</TYPE.label>
                  </AutoColumn>
                </StatItem>
                <StatItem>
                  <AutoColumn $gap="4px">
                    <TYPE.main fontWeight={400} color={'#7E98A7'} fontSize="18px" mb="15px" fontFamily="BarlowCondensed" lineHeight="22px">{t('fees24h')}</TYPE.main>
                    <TYPE.label fontSize="28px" fontFamily="BarlowCondensed" lineHeight="34px">{formatDollarAmount(tokenData.feesUSD)}</TYPE.label>
                  </AutoColumn>
                </StatItem>
              </DarkGreyCard>
              <div style={{ display: "flex", gap: "16px" }}>
                <div style={{ width: "370px"}}>
                  <>
                    {/* <ButtonPrimary
                      onClick={() => setShowTradeModal(true)}
                      bgColor={backgroundColor}
                      style={{ marginTop: '16px' }}
                    >
                      Trade
                    </ButtonPrimary> */}
                    <TYPE.main fontSize="30px" mb={'12px'} ml={'26px'} fontFamily="BarlowCondensed" lineHeight="40px">{t('aboutThisToken')}</TYPE.main>
                    <BoxContainerCard style={{ height: "230px", color: '#7E98A7' }}>
                      <TokenDescription tokenAddress={tokenAddress} /> {/* ✅ No overlap */}
                    </BoxContainerCard>
                    <ButtonPrimary
                      onClick={() => setShowTradeModal(true)}
                      bgColor={'#FFFFFF'}
                      bgHoverColor={'#33D3EB'}
                      style={{ marginTop: '25px', height: '48px', borderRadius: '24px' }}
                    >
                      {t('trade')}
                    </ButtonPrimary>
                  </>
                </div>
                <AutoColumn style={{ width: "calc(100% - 370px)" }} $gap="12px">
                  <>
                    <AutoColumn $gap="16px">
                      <RowBetween>
                        <TYPE.main fontSize="30px" ml={'26px'} fontFamily="BarlowCondensed" lineHeight="40px">{t('chart')}</TYPE.main>
                        {/* <SmallToggleWrapper>
                          <ToggleElementFree
                            isActive={chartSource === ChartSource.DEXSCREENER}
                            fontSize="12px"
                            onClick={() => setChartSource(ChartSource.DEXSCREENER)}
                          >
                            Dex
                          </ToggleElementFree>
                          <ToggleElementFree
                            isActive={chartSource === ChartSource.NATIVE}
                            fontSize="12px"
                            onClick={() => setChartSource(ChartSource.NATIVE)}
                          >
                            {t('native')}
                          </ToggleElementFree>
                        </SmallToggleWrapper> */}
                      </RowBetween>
                    </AutoColumn>

                    <BoxContainerCard>
                      {/* {(chartSource === ChartSource.DEXSCREENER) ? (
                        <DarkGreyCardNoPadding style={{ height: "305px" }}>
                          <DexScreenerIframe
                            src={dexscreenerChartUrl}
                            title="DexScreener Chart"
                            sandbox="allow-scripts allow-same-origin"
                          />
                        </DarkGreyCardNoPadding>
                      ) : ( */}
                      <DarkGreyCard style={{ height: "305px" }}>
                        <RowBetween align="flex-start">
                          <AutoColumn>
                            <RowFixed>
                              <TYPE.label fontSize="24px" height="30px">
                                {/* @ts-ignore */}
                                <MonoSpace>
                                  {latestValue
                                    ? formatDollarAmount(latestValue, 2)
                                    : view === ChartView.VOL
                                      ? formatDollarAmount(formattedVolumeData[formattedVolumeData.length - 1]?.value)
                                      : view === ChartView.TVL
                                        ? formatDollarAmount(formattedTvlData[formattedTvlData.length - 1]?.value)
                                        : formatDollarAmount(tokenData.priceUSD, 2)}
                                </MonoSpace>
                              </TYPE.label>
                            </RowFixed>
                            <TYPE.main height="20px" fontSize="12px" mt={'2px'}>
                              {/* @ts-ignore */}
                              <>
                                {/* @ts-ignore */}
                                {valueLabel ? (
                                  <MonoSpace>{valueLabel}</MonoSpace>
                                ) : (
                                  <MonoSpace style={{ color: '#717171' }}>{formatCurrentDate}</MonoSpace>
                                )}
                              </>
                            </TYPE.main>
                          </AutoColumn>
                          <AutoColumn $gap="8px">
                            <ToggleWrapper width="180px">
                              <ToggleElementFree
                                isActive={view === ChartView.VOL}
                                fontSize="12px"
                                onClick={() => (view === ChartView.VOL ? setView(ChartView.TVL) : setView(ChartView.VOL))}
                              >
                                {t('volume')}
                              </ToggleElementFree>
                              <ToggleElementFree
                                isActive={view === ChartView.TVL}
                                fontSize="12px"
                                onClick={() => (view === ChartView.TVL ? setView(ChartView.PRICE) : setView(ChartView.TVL))}
                              >
                                {t('tvl')}
                              </ToggleElementFree>
                              <ToggleElementFree
                                isActive={view === ChartView.PRICE}
                                fontSize="12px"
                                onClick={() => setView(ChartView.PRICE)}
                              >
                                {t('price')}
                              </ToggleElementFree>
                            </ToggleWrapper>
                          </AutoColumn>
                        </RowBetween>
                        {view === ChartView.TVL ? (
                          <LineChart
                            data={formattedTvlData}
                            color={backgroundColor}
                            minHeight={236}
                            value={latestValue}
                            label={valueLabel}
                            setValue={setLatestValue}
                            setLabel={setValueLabel}
                          />
                        ) : view === ChartView.VOL ? (
                          <BarChart
                            data={formattedVolumeData}
                            color={backgroundColor}
                            minHeight={236}
                            value={latestValue}
                            label={valueLabel}
                            setValue={setLatestValue}
                            setLabel={setValueLabel}
                          />
                        ) : view === ChartView.PRICE ? (
                          adjustedToCurrent ? (
                            <CandleChart
                              data={adjustedToCurrent}
                              setValue={setLatestValue}
                              setLabel={setValueLabel}
                              color={backgroundColor}
                            />
                          ) : (
                            <LocalLoader fill={false} />
                          )
                        ) : null}
                      </DarkGreyCard>
                      {/* )} */}
                    </BoxContainerCard>
                  </>
                </AutoColumn>
              </div>



              <TYPE.main fontFamily="BarlowCondensed" fontWeight={400} fontSize="30px" lineHeight="40px">{t('pools')}</TYPE.main>
              <DarkGreyCard style={{ paddingTop: 0, paddingBottom: 0 }}>
                <PoolTable poolDatas={poolDatas} />
              </DarkGreyCard>
              <SectionHeader>
                <TYPE.main fontFamily="BarlowCondensed" fontWeight={400} fontSize="30px" lineHeight="40px">{t('transactions')}</TYPE.main>
                {/* <SmallToggleWrapper>
                  <ToggleElementFree
                    isActive={transactionSource === TransactionSource.DEXSCREENER}
                    fontSize="12px"
                    onClick={() => setTransactionSource(TransactionSource.DEXSCREENER)}
                  >
                    Dex
                  </ToggleElementFree>
                  <ToggleElementFree
                    isActive={transactionSource === TransactionSource.NATIVE}
                    fontSize="12px"
                    onClick={() => setTransactionSource(TransactionSource.NATIVE)}
                  >
                    {t('native')}
                  </ToggleElementFree>
                </SmallToggleWrapper> */}
              </SectionHeader>
              {/* {transactionSource === TransactionSource.DEXSCREENER ? (
                <DarkGreyCardNoPadding>
                  <DexScreenerIframe
                    src={dexscreenerTransactionsUrl}
                    title="DexScreener Transactions"
                    sandbox="allow-scripts allow-same-origin"
                  />
                </DarkGreyCardNoPadding>
              ) : ( */}
              <DarkGreyCard>
                {transactions ? (
                  <TransactionTable transactions={transactions} color={backgroundColor} />
                ) : (
                  <LocalLoader fill={false} />
                )}
              </DarkGreyCard>
              {/* )} */}
            </AutoColumn>
          )
        ) : (
          <Loader />
        )}

        {/* Trade Modal */}
        <Modal isOpen={showTradeModal} onDismiss={() => setShowTradeModal(false)} maxWidth={`520px`}>
          <TradeModalContent>
            <ModalHeader>
              <TYPE.mediumHeader>{t('trade')} {tokenData?.symbol}</TYPE.mediumHeader>
              <HeaderIcons>
                <ExternalLinkIcon
                  href={directSwapUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ExternalLink size={20} />
                </ExternalLinkIcon>
                <IconButton onClick={() => setShowTradeModal(false)}>
                  <X size={20} />
                </IconButton>
              </HeaderIcons>
            </ModalHeader>

            <TradeIframe
              ref={iframeRef}
              src={swapIframeUrl}
              title="Datadex Swap"
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox"
              onLoad={() => {
                // iframe 加载完成后发送 ChainBox provider 信息
                sendChainBoxProviderToIframe()
              }}
            />
          </TradeModalContent>
        </Modal>
      </PageWrapper>
    </Trace>
  )
}