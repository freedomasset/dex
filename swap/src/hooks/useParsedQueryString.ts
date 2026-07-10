import { parse, ParsedQs } from 'qs'
import { useMemo } from 'react'
import { useLocation } from 'react-router-dom'

export function parsedQueryString(search?: string): ParsedQs {
  let s = search
  if (!s) {
    // HashRouter：查询串在 #/path?lng=xx 里，不在 window.location.search
    const hash = window.location.hash
    const q = hash.indexOf('?')
    s = q >= 0 ? hash.slice(q) : ''
  }
  return s && s.length > 1 ? parse(s, { parseArrays: false, ignoreQueryPrefix: true }) : {}
}

export default function useParsedQueryString(): ParsedQs {
  const { search } = useLocation()
  return useMemo(() => parsedQueryString(search), [search])
}
