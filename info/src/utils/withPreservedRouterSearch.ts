import type { To } from 'react-router-dom'
import { ParsedQs, parse, stringify } from 'qs'

export function toWithPreservedRouterSearch(pathname: string, currentSearch: string | undefined): To {
  const search = currentSearch ?? ''
  return { pathname, search }
}

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
