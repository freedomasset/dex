import React, { useMemo, useState } from 'react'
import styled from 'styled-components'
import { isAddress } from 'utils'
import Logo from '../Logo'
import { useCombinedActiveList } from 'state/lists/hooks'
import useHttpLocations from 'hooks/useHttpLocations'
import { useActiveNetworkVersion } from 'state/application/hooks'
import { OptimismNetworkInfo } from 'constants/networks'
import EthereumLogo from '../../assets/images/ethereum-logo.png'
import { ChainId } from '@vanadex/sdk-core'
import { TT_CHAIN_MAINNET_CHAIN_ID, TT_CHAIN_TESTNET_CHAIN_ID } from 'constants/chains'

export function chainIdToNetworkName(networkId: number | ChainId) {
  switch (networkId) {
    case ChainId.MAINNET:
    case ChainId.SEPOLIA:
      return 'ethereum'
    case ChainId.POLYGON:
      return 'polygon'
    case ChainId.BNB:
      return 'smartchain'
    case TT_CHAIN_TESTNET_CHAIN_ID:
    case TT_CHAIN_MAINNET_CHAIN_ID:
      return 'ethereum'
    default:
      return 'ethereum'
  }
}

const getTokenLogoURL = ({ address, chainId }: { address: string; chainId: number | ChainId }) => {
  return `https://raw.githubusercontent.com/uniswap/assets/master/blockchains/${chainIdToNetworkName(
    chainId,
  )}/assets/${address}/logo.png`
}

const StyledLogo = styled(Logo)<{ size: string }>`
  width: ${({ size }) => size};
  height: ${({ size }) => size};
  border-radius: ${({ size }) => size};
  box-shadow: 0px 6px 10px rgba(0, 0, 0, 0.075);
  background-color: ${({ theme }) => theme.white};
  color: ${({ theme }) => theme.text4};
`

const DefaultLogo = styled.div<{ size: string }>`
  width: ${({ size }) => size};
  height: ${({ size }) => size};
  border-radius: 50%;
  background-color: rgba(128, 128, 128, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  font-size: ${({ size }) => {
    const sizeNum = parseInt(size.replace('px', ''))
    return `${Math.max(10, sizeNum * 0.5)}px`
  }};
  text-transform: uppercase;
  flex-shrink: 0;
`

const StyledEthereumLogo = styled.img<{ size: string }>`
  width: ${({ size }) => size};
  height: ${({ size }) => size};
  box-shadow: 0px 6px 10px rgba(0, 0, 0, 0.075);
  border-radius: 24px;
`

export default function CurrencyLogo({
  address,
  size = '24px',
  style,
  symbol,
  ...rest
}: {
  address?: string
  size?: string
  style?: React.CSSProperties
  symbol?: string // 代币符号，用于生成默认 logo
}) {
  // useOptimismList()
  // const optimismList = useCombinedActiveList()?.[10]
  // const arbitrumList = useCombinedActiveList()?.[42161]
  // const polygon = useCombinedActiveList()?.[137]
  // const celo = useCombinedActiveList()?.[42220]
  // const bnbList = useCombinedActiveList()?.[ChainId.BNB]
  // const baseList = useCombinedActiveList()?.[ChainId.BASE]
  const vanaList = useCombinedActiveList()?.[ChainId.VANA]
  const vanaMokshaList = useCombinedActiveList()?.[ChainId.VANA_MOKSHA]

  const [activeNetwork] = useActiveNetworkVersion()

  const checkSummed = isAddress(address)

  // const optimismURI = useMemo(() => {
  //   if (checkSummed && optimismList?.[checkSummed]) {
  //     return optimismList?.[checkSummed].token.logoURI
  //   }
  //   return undefined
  // }, [checkSummed, optimismList])
  // const uriLocationsOptimism = useHttpLocations(optimismURI)

  // const arbitrumURI = useMemo(() => {
  //   if (checkSummed && arbitrumList?.[checkSummed]) {
  //     return arbitrumList?.[checkSummed].token.logoURI
  //   }
  //   return undefined
  // }, [checkSummed, arbitrumList])
  // const uriLocationsArbitrum = useHttpLocations(arbitrumURI)

  // const BNBURI = useMemo(() => {
  //   if (checkSummed && bnbList?.[checkSummed]) {
  //     return bnbList?.[checkSummed].token.logoURI
  //   }
  //   return undefined
  // }, [checkSummed, bnbList])
  // const uriLocationsBNB = useHttpLocations(BNBURI)

  // const BaseURI = useMemo(() => {
  //   if (checkSummed && baseList?.[checkSummed]) {
  //     return baseList?.[checkSummed].token.logoURI
  //   }
  //   return undefined
  // }, [checkSummed, baseList])
  // const uriLocationsBase = useHttpLocations(BaseURI)

  // const polygonURI = useMemo(() => {
  //   if (checkSummed && polygon?.[checkSummed]) {
  //     return polygon?.[checkSummed].token.logoURI
  //   }
  //   return undefined
  // }, [checkSummed, polygon])
  // const uriLocationsPolygon = useHttpLocations(polygonURI)

  // const celoURI = useMemo(() => {
  //   if (checkSummed && celo?.[checkSummed]) {
  //     return celo?.[checkSummed].token.logoURI
  //   }
  //   return undefined
  // }, [checkSummed, celo])
  // const uriLocationsCelo = useHttpLocations(celoURI)

  const vanaURI = useMemo(() => {
    if (checkSummed && vanaList?.[checkSummed]) {
      return vanaList?.[checkSummed].token.logoURI
    }
    return undefined
  }, [checkSummed, vanaList])
  const uriLocationsVana = useHttpLocations(vanaURI)

  const vanaMokshaURI = useMemo(() => {
    if (checkSummed && vanaMokshaList?.[checkSummed]) {
      return vanaMokshaList?.[checkSummed].token.logoURI
    }
    return undefined
  }, [checkSummed, vanaMokshaList])
  const uriLocationsVanaMoksha = useHttpLocations(vanaMokshaURI)

  // 获取代币 symbol，用于生成默认 logo
  const tokenSymbol = useMemo(() => {
    if (symbol) return symbol
    if (checkSummed && vanaList?.[checkSummed]) {
      return vanaList[checkSummed].token.symbol
    }
    if (checkSummed && vanaMokshaList?.[checkSummed]) {
      return vanaMokshaList[checkSummed].token.symbol
    }
    // 如果没有 symbol，从地址生成一个简短的标识
    if (address) {
      return address.slice(2, 6).toUpperCase()
    }
    return '?'
  }, [symbol, checkSummed, vanaList, vanaMokshaList, address])

  //temp until token logo issue merged
  const tempSources: { [address: string]: string } = useMemo(() => {
    return {
      ['0x4dd28568d05f09b02220b09c2cb307bfd837cb95']:
        'https://assets.coingecko.com/coins/images/18143/thumb/wCPb0b88_400x400.png?1630667954',
    }
  }, [])

  const srcs: string[] = useMemo(() => {
    const checkSummed = isAddress(address)

    if (checkSummed && address) {
      const override = tempSources[address]
      return [
        getTokenLogoURL({ address: checkSummed, chainId: activeNetwork.chainId }),
        // ...uriLocationsOptimism,
        // ...uriLocationsArbitrum,
        // ...uriLocationsPolygon,
        // ...uriLocationsCelo,
        // ...uriLocationsBNB,
        // ...uriLocationsBase,
        ...uriLocationsVana,
        ...uriLocationsVanaMoksha,
        override,
      ]
    }
    return []
  }, [
    address,
    tempSources,
    activeNetwork.chainId,
    // uriLocationsOptimism,
    // uriLocationsArbitrum,
    // uriLocationsPolygon,
    // uriLocationsCelo,
    // uriLocationsBNB,
    // uriLocationsBase,
    uriLocationsVana,
    uriLocationsVanaMoksha,
  ])

  if (activeNetwork === OptimismNetworkInfo && address === '0x4200000000000000000000000000000000000006') {
    return <StyledEthereumLogo src={EthereumLogo} size={size} style={style} {...rest} />
  }

  // 如果没有图片源，直接显示默认 logo
  if (srcs.length === 0) {
    const displayText = tokenSymbol ? tokenSymbol.charAt(0).toUpperCase() : '?'
    return (
      <DefaultLogo size={size} style={style} {...rest}>
        {displayText}
      </DefaultLogo>
    )
  }

  // 使用自定义 Logo 组件，支持显示默认 logo
  return <LogoWithFallback size={size} srcs={srcs} tokenSymbol={tokenSymbol} style={style} {...rest} />
}

// 带默认 logo 回退的 Logo 组件
const LogoWithFallback = ({ size, srcs, tokenSymbol, style, ...rest }: { size: string; srcs: string[]; tokenSymbol: string; style?: React.CSSProperties; [key: string]: any }) => {
  const [failedSrcs, setFailedSrcs] = useState<Set<string>>(new Set())
  const [imageLoaded, setImageLoaded] = useState(false)
  const [, refresh] = useState(0)

  const displayText = tokenSymbol ? tokenSymbol.charAt(0).toUpperCase() : '?'
  const availableSrc = srcs.find((src) => src && !failedSrcs.has(src))

  // 如果所有图片都加载失败，显示默认 logo
  if (!availableSrc) {
    return (
      <DefaultLogo size={size} style={style} {...rest}>
        {displayText}
      </DefaultLogo>
    )
  }

  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      {/* 默认显示字母 logo */}
      {!imageLoaded && (
        <DefaultLogo 
          size={size} 
          style={{ 
            ...style, 
            position: 'absolute', 
            top: 0, 
            left: 0,
            zIndex: 1 
          }}
        >
          {displayText}
        </DefaultLogo>
      )}
      {/* 图片加载成功后显示 */}
      <img
        {...rest}
        alt={'token logo'}
        src={availableSrc}
        style={{ 
          ...style, 
          width: size, 
          height: size, 
          borderRadius: '50%', 
          objectFit: 'cover',
          position: imageLoaded ? 'relative' : 'absolute',
          top: imageLoaded ? 0 : 0,
          left: imageLoaded ? 0 : 0,
          opacity: imageLoaded ? 1 : 0,
          transition: 'opacity 0.2s ease',
          zIndex: 2
        }}
        onLoad={() => {
          setImageLoaded(true)
        }}
        onError={() => {
          setFailedSrcs((prev) => {
            const newSet = new Set(prev)
            if (availableSrc) {
              newSet.add(availableSrc)
            }
            return newSet
          })
          refresh((i) => i + 1)
        }}
      />
    </div>
  )
}
