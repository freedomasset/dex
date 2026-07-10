import { getChainParamFromChainId } from 'constants/chains'
import { ParsedQs } from 'qs'

const SWAP_TOKEN_QUERY_KEYS = ['inputCurrency', 'outputCurrency', 'minPrice', 'maxPrice'] as const

/** 路径或 query 与当前链绑定，切链后应回到 /swap */
export function shouldResetRouteOnChainChange(pathname: string, qs: ParsedQs): boolean {
  if (isChainSpecificDetailPath(pathname)) return true
  return hasChainSpecificSwapQuery(qs) && (pathname === '/swap' || pathname === '/')
}

/** 仓位 tokenId、流动性操作路径等（不含 /pools/v2 列表页） */
function isChainSpecificDetailPath(pathname: string): boolean {
  if (/^\/(?:pool|pools)\/v2\b/.test(pathname)) return false
  if (/^\/(?:pool|pools)\/[^/]+/.test(pathname)) return true
  if (pathname.startsWith('/remove/')) return true
  if (pathname.startsWith('/add/')) return true
  if (pathname.startsWith('/increase/')) return true
  if (/^\/migrate\/v2\/[^/]+/.test(pathname)) return true
  return false
}

function hasChainSpecificSwapQuery(qs: ParsedQs): boolean {
  return typeof qs.inputCurrency === 'string' || typeof qs.outputCurrency === 'string'
}

export function buildCleanSwapSearch(chainId: number, currentQs: ParsedQs): string {
  const chainParam = getChainParamFromChainId(chainId)
  const params = new URLSearchParams()
  for (const [key, value] of Object.entries(currentQs)) {
    if (key === 'chain') continue
    if (SWAP_TOKEN_QUERY_KEYS.includes(key as (typeof SWAP_TOKEN_QUERY_KEYS)[number])) continue
    if (typeof value === 'string' && value.length > 0) {
      params.set(key, value)
    }
  }
  if (chainParam) {
    params.set('chain', chainParam)
  }
  const next = params.toString()
  return next ? `?${next}` : ''
}
