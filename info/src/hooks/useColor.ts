import { useState, useLayoutEffect, useMemo } from 'react'
import { shade } from 'polished'
import Vibrant from 'node-vibrant'
import { hex } from 'wcag-contrast'
import { Token } from '@vanadex/sdk-core'
import uriToHttp from 'utils/uriToHttp'
import { isAddress } from 'utils'

async function getColorFromToken(token: Token): Promise<string | null> {
  const path = `https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/${token.address}/logo.png`

  return Vibrant.from(path)
    .getPalette()
    .then((palette) => {
      if (palette?.Vibrant) {
        let detectedHex = palette.Vibrant.hex
        let AAscore = hex(detectedHex, '#FFF')
        while (AAscore < 3) {
          detectedHex = shade(0.005, detectedHex)
          AAscore = hex(detectedHex, '#FFF')
        }
        return detectedHex
      }
      return null
    })
    .catch(() => null)
}

async function getColorFromUriPath(uri: string): Promise<string | null> {
  const formattedPath = uriToHttp(uri)[0]

  return Vibrant.from(formattedPath)
    .getPalette()
    .then((palette) => {
      if (palette?.Vibrant) {
        return palette.Vibrant.hex
      }
      return null
    })
    .catch(() => null)
}

export function useColor(address?: string) {
  const [color, setColor] = useState('#33D3EB')

  const formattedAddress = isAddress(address)

  const token = useMemo(() => {
    return formattedAddress ? new Token(1, formattedAddress, 0) : undefined
  }, [formattedAddress])

  useLayoutEffect(() => {
    let stale = false

    if (token) {
      getColorFromToken(token).then((tokenColor) => {
        if (!stale) {
          if (tokenColor !== null) {
            setColor(tokenColor)
          } else {
            // 如果获取颜色失败，使用默认颜色
            setColor('#33D3EB')
          }
        }
      }).catch(() => {
        // 如果发生错误，使用默认颜色
        if (!stale) {
          setColor('#33D3EB')
        }
      })
    } else {
      // 如果没有 token，使用默认颜色
      setColor('#33D3EB')
    }

    return () => {
      stale = true
    }
  }, [token])

  return color
}

export function useListColor(listImageUri?: string) {
  const [color, setColor] = useState('#33D3EB')

  useLayoutEffect(() => {
    let stale = false

    if (listImageUri) {
      getColorFromUriPath(listImageUri).then((color) => {
        if (!stale && color !== null) {
          setColor(color)
        }
      })
    }

    return () => {
      stale = true
      setColor('#33D3EB')
    }
  }, [listImageUri])

  return color
}
