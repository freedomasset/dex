import { DEFAULT_LOCALE, SUPPORTED_LOCALES, SupportedLocale } from 'constants/locales'
import { useMemo } from 'react'
import store from 'state'
import { useUserLocale } from 'state/user/hooks'

import useParsedQueryString, { parsedQueryString } from './useParsedQueryString'

function lngFromQuery(parsed: ReturnType<typeof parsedQueryString>): string | undefined {
  const raw = parsed.lng
  if (typeof raw === 'string') return raw
  if (Array.isArray(raw) && typeof raw[0] === 'string') return raw[0]
  return undefined
}

/**
 * Given a locale string (e.g. from user agent), return the best match for corresponding SupportedLocale
 * @param maybeSupportedLocale the fuzzy locale identifier
 */
function parseLocale(maybeSupportedLocale: unknown): SupportedLocale | undefined {
  if (typeof maybeSupportedLocale !== 'string') return undefined
  const lowerMaybeSupportedLocale = maybeSupportedLocale.toLowerCase()
  return SUPPORTED_LOCALES.find(
    (locale) => locale.toLowerCase() === lowerMaybeSupportedLocale || locale.split('-')[0] === lowerMaybeSupportedLocale
  )
}

/**
 * Returns the supported locale read from the user agent (navigator)
 */
export function navigatorLocale(): SupportedLocale | undefined {
  if (!navigator.language) return undefined

  const [language, region] = navigator.language.split('-')

  if (region) {
    return parseLocale(`${language}-${region.toUpperCase()}`) ?? parseLocale(language)
  }

  return parseLocale(language)
}

function storeLocale(): SupportedLocale | undefined {
  return store.getState().user.userLocale ?? undefined
}

/** 无 ?lng、无已保存语言时固定英文，不按浏览器语言自动选中文等 */
export const initialLocale = parseLocale(lngFromQuery(parsedQueryString())) ?? storeLocale() ?? DEFAULT_LOCALE

function useUrlLocale() {
  const parsed = useParsedQueryString()
  return parseLocale(lngFromQuery(parsed))
}

/**
 * Returns the currently active locale, from a combination of user agent, query string, and user settings stored in redux
 * Stores the query string locale in redux (if set) to persist across sessions
 */
export function useActiveLocale(): SupportedLocale {
  const urlLocale = useUrlLocale()
  const userLocale = useUserLocale()
  return useMemo(() => urlLocale ?? userLocale ?? DEFAULT_LOCALE, [urlLocale, userLocale])
}
