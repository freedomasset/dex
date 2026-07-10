import { getPercentChange } from './../../utils/data'
import { useQuery } from '@apollo/client'
import gql from 'graphql-tag'
import { useDeltaTimestamps } from 'utils/queries'
import { useBlocksFromTimestamps } from 'hooks/useBlocksFromTimestamps'
import { get2DayChange } from 'utils/data'
import { TokenData } from 'state/tokens/reducer'
import { useEthPrices } from 'hooks/useEthPrices'
import { formatTokenSymbol, formatTokenName } from 'utils/tokens'
import { useActiveNetworkVersion, useClients } from 'state/application/hooks'
import { START_BLOCKS } from 'constants/index'
import { SupportedNetwork } from 'constants/networks'

export const TOKENS_BULK = (block: number | undefined, tokens: string[]) => {
  let tokenString = `[`
  tokens.map((address) => {
    return (tokenString += `"${address}",`)
  })
  tokenString += ']'
  const queryString =
    `
    query tokens {
      tokens(where: {id_in: ${tokenString}},` +
    (block ? `block: {number: ${block}} ,` : ``) +
    ` orderBy: totalValueLockedUSD, orderDirection: desc, subgraphError: allow) {
        id
        symbol
        name
        derivedETH
        volumeUSD
        volume
        txCount
        totalValueLocked
        feesUSD
        totalValueLockedUSD
      }
    }
    `
  return gql(queryString)
}

interface TokenFields {
  id: string
  symbol: string
  name: string
  derivedETH: string
  volumeUSD: string
  volume: string
  feesUSD: string
  txCount: string
  totalValueLocked: string
  totalValueLockedUSD: string
}

interface TokenDataResponse {
  tokens: TokenFields[]
  bundles: {
    ethPriceUSD: string
  }[]
}

/**
 * Fetch top addresses by volume
 */
export function useFetchedTokenDatas(tokenAddresses: string[]): {
  loading: boolean
  error: boolean
  data:
    | {
        [address: string]: TokenData
      }
    | undefined
} {
  const [activeNetwork] = useActiveNetworkVersion()
  const { dataClient } = useClients()

  console.log('[useFetchedTokenDatas] Called with tokenAddresses:', { 
    count: tokenAddresses?.length, 
    addresses: tokenAddresses,
    isEmpty: !tokenAddresses || tokenAddresses.length === 0
  })

  // 如果地址数组为空，标记为跳过，但必须先调用所有 hooks
  const shouldSkip = !tokenAddresses || tokenAddresses.length === 0

  // get blocks from historic timestamps
  const [t24, t48, tWeek] = useDeltaTimestamps()

  const { blocks, error: blockError } = useBlocksFromTimestamps([t24, t48, tWeek])
  const [block24, block48, blockWeek] = blocks ?? []
  const ethPrices = useEthPrices()

  console.log('[useFetchedTokenDatas] Blocks state:', { 
    hasBlocks: !!blocks, 
    block24: block24?.number, 
    block48: block48?.number, 
    blockWeek: blockWeek?.number,
    blockError,
    hasEthPrices: !!ethPrices
  })

  // 定义最小区块号
  const MIN_BLOCK = START_BLOCKS[activeNetwork.id]

  // 安全获取区块号，确保不小于最小区块
  // 确保转换为数字类型进行比较
  const block24Num = block24?.number ? (typeof block24.number === 'string' ? parseInt(block24.number, 10) : Number(block24.number)) : 0
  const block48Num = block48?.number ? (typeof block48.number === 'string' ? parseInt(block48.number, 10) : Number(block48.number)) : 0
  const blockWeekNum = blockWeek?.number ? (typeof blockWeek.number === 'string' ? parseInt(blockWeek.number, 10) : Number(blockWeek.number)) : 0

  const safeBlock24 = block24Num >= MIN_BLOCK ? block24Num : undefined
  const safeBlock48 = block48Num >= MIN_BLOCK ? block48Num : undefined
  const safeBlockWeek = blockWeekNum >= MIN_BLOCK ? blockWeekNum : undefined

  console.log('[useFetchedTokenDatas] Block numbers:', { 
    MIN_BLOCK,
    block24Num, 
    block48Num, 
    blockWeekNum,
    safeBlock24, 
    safeBlock48, 
    safeBlockWeek
  })

  const { loading, error, data } = useQuery<TokenDataResponse>(TOKENS_BULK(undefined, tokenAddresses), {
    client: dataClient,
    skip: shouldSkip, // 如果地址数组为空，跳过查询
  })

  const {
    loading: loading24,
    error: error24,
    data: data24,
  } = useQuery<TokenDataResponse>(TOKENS_BULK(safeBlock24, tokenAddresses), {
    client: dataClient,
    skip: shouldSkip || !safeBlock24, // 如果地址数组为空或区块号无效，跳过查询
  })

  const {
    loading: loading48,
    error: error48,
    data: data48,
  } = useQuery<TokenDataResponse>(TOKENS_BULK(safeBlock48, tokenAddresses), {
    client: dataClient,
    skip: shouldSkip || !safeBlock48,
  })

  const {
    loading: loadingWeek,
    error: errorWeek,
    data: dataWeek,
  } = useQuery<TokenDataResponse>(TOKENS_BULK(safeBlockWeek, tokenAddresses), {
    client: dataClient,
    skip: shouldSkip || !safeBlockWeek, // 如果地址数组为空或区块号无效，跳过查询
  })

  console.log('[useFetchedTokenDatas] Query states:', {
    loading,
    loading24,
    loading48,
    loadingWeek,
    error,
    error24,
    error48,
    errorWeek,
    hasData: !!data,
    hasData24: !!data24,
    hasData48: !!data48,
    hasDataWeek: !!dataWeek,
    tokensCount: data?.tokens?.length
  })

  const anyError = Boolean(error || error24 || error48 || blockError || errorWeek)
  const anyLoading = Boolean(loading || loading24 || loading48 || loadingWeek)
  // priceUSD = derivedETH * ethPrices.current，必须等 ethPrices 就绪再写入，否则会存成 0
  const waitingForEthPrices = !ethPrices

  console.log('[useFetchedTokenDatas] Combined states:', { anyError, anyLoading, hasBlocks: !!blocks, shouldSkip, hasEthPrices: !!ethPrices })

  // 如果地址数组为空，直接返回空数据
  if (shouldSkip) {
    console.log('[useFetchedTokenDatas] Skipping - empty tokenAddresses')
    return {
      loading: false,
      error: false,
      data: {},
    }
  }

  // 未就绪时继续等待：子图错误/loading，或 ethPrices 未加载（否则 priceUSD 会算成 0 并写入 Redux）
  if (anyError || anyLoading || waitingForEthPrices) {
    console.log('[useFetchedTokenDatas] Returning early - waiting for data:', { anyError, anyLoading, waitingForEthPrices })
    return {
      loading: anyLoading || waitingForEthPrices,
      error: anyError,
      data: undefined,
    }
  }

  const parsed = data?.tokens
    ? data.tokens.reduce((accum: { [address: string]: TokenFields }, poolData) => {
        accum[poolData.id] = poolData
        return accum
      }, {})
    : {}
  
  console.log('[useFetchedTokenDatas] Parsed current tokens:', { parsedCount: Object.keys(parsed).length, parsed })
  
  const parsed24 = data24?.tokens
    ? data24.tokens.reduce((accum: { [address: string]: TokenFields }, poolData) => {
        accum[poolData.id] = poolData
        return accum
      }, {})
    : {}
  const parsed48 = data48?.tokens
    ? data48.tokens.reduce((accum: { [address: string]: TokenFields }, poolData) => {
        accum[poolData.id] = poolData
        return accum
      }, {})
    : {}
  const parsedWeek = dataWeek?.tokens
    ? dataWeek.tokens.reduce((accum: { [address: string]: TokenFields }, poolData) => {
        accum[poolData.id] = poolData
        return accum
      }, {})
    : {}

  // format data and calculate daily changes
  const formatted = tokenAddresses.reduce((accum: { [address: string]: TokenData }, address) => {
    const current: TokenFields | undefined = parsed[address]
    const oneDay: TokenFields | undefined = parsed24[address]
    const twoDay: TokenFields | undefined = parsed48[address]
    const week: TokenFields | undefined = parsedWeek[address]

    const [volumeUSD, volumeUSDChange] =
      current && oneDay && twoDay
        ? get2DayChange(current.volumeUSD, oneDay.volumeUSD, twoDay.volumeUSD)
        : current
          ? [parseFloat(current.volumeUSD), 0]
          : [0, 0]

    const volumeUSDWeek =
      current && week
        ? parseFloat(current.volumeUSD) - parseFloat(week.volumeUSD)
        : current
          ? parseFloat(current.volumeUSD)
          : 0
    const tvlUSD = current ? parseFloat(current.totalValueLockedUSD) : 0
    const tvlUSDChange = getPercentChange(current?.totalValueLockedUSD, oneDay?.totalValueLockedUSD)
    const tvlToken = current ? parseFloat(current.totalValueLocked) : 0
    const priceUSD = current && ethPrices ? parseFloat(current.derivedETH) * ethPrices.current : 0
    const priceUSDOneDay = oneDay && ethPrices ? parseFloat(oneDay.derivedETH) * ethPrices.oneDay : 0
    const priceUSDWeek = week && ethPrices ? parseFloat(week.derivedETH) * ethPrices.week : 0
    const priceUSDChange =
      priceUSD && priceUSDOneDay ? getPercentChange(priceUSD.toString(), priceUSDOneDay.toString()) : 0

    const priceUSDChangeWeek =
      priceUSD && priceUSDWeek ? getPercentChange(priceUSD.toString(), priceUSDWeek.toString()) : 0
    const txCount =
      current && oneDay
        ? parseFloat(current.txCount) - parseFloat(oneDay.txCount)
        : current
          ? parseFloat(current.txCount)
          : 0
    const feesUSD =
      current && oneDay
        ? parseFloat(current.feesUSD) - parseFloat(oneDay.feesUSD)
        : current
          ? parseFloat(current.feesUSD)
          : 0

    accum[address] = {
      exists: !!current,
      address,
      name: current ? formatTokenName(address, current.name, activeNetwork) : '',
      symbol: current ? formatTokenSymbol(address, current.symbol, activeNetwork) : '',
      volumeUSD,
      volumeUSDChange,
      volumeUSDWeek,
      txCount,
      tvlUSD,
      feesUSD,
      tvlUSDChange,
      tvlToken,
      priceUSD,
      priceUSDChange,
      priceUSDChangeWeek,
    }

    return accum
  }, {})

  console.log('[useFetchedTokenDatas] Final formatted data:', { 
    formattedCount: Object.keys(formatted).length, 
    formattedKeys: Object.keys(formatted)
  })

  return {
    loading: anyLoading,
    error: anyError,
    data: formatted,
  }
}
