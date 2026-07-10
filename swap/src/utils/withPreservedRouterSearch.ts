import { parse, ParsedQs, stringify } from 'qs'
import type { To } from 'react-router-dom'

const PRICE_RANGE_QUERY_KEYS = ['minPrice', 'maxPrice'] as const

/** Remove add-liquidity price range params; they must not persist across routes. */
function stripPriceRangeFromRouterSearch(search: string | undefined): string {
  if (!search) {
    return ''
  }
  const params = new URLSearchParams(search.startsWith('?') ? search.slice(1) : search)
  PRICE_RANGE_QUERY_KEYS.forEach((key) => params.delete(key))
  const next = params.toString()
  return next ? `?${next}` : ''
}

/** Preserve current hash-router query (e.g. `?chain=…&lng=…`) when building a route target */
export function toWithPreservedRouterSearch(pathname: string, currentSearch: string | undefined): To {
  const search = stripPriceRangeFromRouterSearch(currentSearch)
  return { pathname, search }
}

/** Merge parsed query dict into current URL search without dropping existing keys unless overwritten */
export function mergeRouterSearch(currentSearch: string | undefined, patch: ParsedQs): string {
  const parsed = parse(currentSearch || '', { ignoreQueryPrefix: true, parseArrays: false }) as ParsedQs
  const merged: ParsedQs = { ...parsed, ...patch }
  Object.keys(merged).forEach((k) => {
    const v = merged[k]
    if (v === undefined || v === null || v === '') {
      delete merged[k]
    }
  })
  const s = stringify(merged, { addQueryPrefix: true })
  return s
}

/** Remove a query key from the URL part before `#` (HashRouter ignores it there). */
function stripMainUrlQueryParam(fullUrl: string, key: string): string {
  const hashIdx = fullUrl.indexOf('#')
  const main = hashIdx >= 0 ? fullUrl.slice(0, hashIdx) : fullUrl
  const hashPart = hashIdx >= 0 ? fullUrl.slice(hashIdx) : ''
  try {
    const u = new URL(main)
    u.searchParams.delete(key)
    const search = u.searchParams.toString()
    const nextMain = `${u.origin}${u.pathname}${search ? `?${search}` : ''}`
    return nextMain + hashPart
  } catch {
    return fullUrl
  }
}

/**
 * Set a query parameter on HashRouter fragments (`#/path?a=1`).
 * Never puts the key on the main URL search — that duplicates params when the target app uses HashRouter.
 */
export function ensureHashRouterQueryParam(fullUrl: string, key: string, value: string): string {
  const cleaned = stripMainUrlQueryParam(fullUrl, key)
  const hashIdx = cleaned.indexOf('#')

  if (hashIdx < 0) {
    try {
      const u = new URL(cleaned)
      const root = `${u.origin}${u.pathname}`.replace(/\/$/, '') || u.origin
      const sp = new URLSearchParams()
      sp.set(key, value)
      return `${root}/#/?${sp.toString()}`
    } catch {
      const base = cleaned.split('?')[0].replace(/\/$/, '')
      return `${base}/#/?${encodeURIComponent(key)}=${encodeURIComponent(value)}`
    }
  }

  const before = cleaned.slice(0, hashIdx + 1)
  const frag = cleaned.slice(hashIdx + 1)
  const qPos = frag.indexOf('?')
  const pathOnly = qPos >= 0 ? frag.slice(0, qPos) : frag
  const queryOnly = qPos >= 0 ? frag.slice(qPos + 1) : ''
  const sp = new URLSearchParams(queryOnly)
  sp.set(key, value)
  const next = sp.toString()
  return `${before}${pathOnly}?${next}`
}
