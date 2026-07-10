import { Plural, Trans } from '@lingui/macro'

import { ZERO_ADDRESS } from './misc'
import { NATIVE_CHAIN_ID } from './tokens'
import tokenSafetyLookup, { TOKEN_LIST_TYPES } from './tokenSafetyLookup'

export const TOKEN_SAFETY_ARTICLE = 'https://support.uniswap.org/hc/en-us/articles/8723118437133'

export enum WARNING_LEVEL {
  MEDIUM,
  UNKNOWN,
}

export function getWarningCopy(warning: Warning | null, plural = false) {
  let heading = null,
    description = null
  if (warning) {
    switch (warning.level) {
      case WARNING_LEVEL.MEDIUM:
        heading = (
          <Plural
            value={plural ? 2 : 1}
            _1="This token isn't traded on leading U.S. centralized exchanges."
            other="These tokens aren't traded on leading U.S. centralized exchanges."
          />
        )
        description = <Trans>Always conduct your own research before trading.</Trans>
        break
      case WARNING_LEVEL.UNKNOWN:
        heading = (
          <Plural
            value={plural ? 2 : 1}
            _1="This token isn't traded on leading U.S. centralized exchanges or frequently swapped on The Data DEX."
            other="These tokens aren't traded on leading U.S. centralized exchanges or frequently swapped on The Data DEX."
          />
        )
        description = <Trans>Always conduct your own research before trading.</Trans>
        break
    }
  }
  return { heading, description }
}

export type Warning = {
  level: WARNING_LEVEL
  message: JSX.Element
  /** Determines whether triangle/slash alert icon is used, and whether this token is supported/able to be traded. */
  canProceed: boolean
}

const MediumWarning: Warning = {
  level: WARNING_LEVEL.MEDIUM,
  message: <Trans>Caution</Trans>,
  canProceed: true,
}

const StrongWarning: Warning = {
  level: WARNING_LEVEL.UNKNOWN,
  message: <Trans>Warning</Trans>,
  canProceed: true,
}

export const NotFoundWarning: Warning = {
  level: WARNING_LEVEL.UNKNOWN,
  message: <Trans>Token not found</Trans>,
  canProceed: false,
}

export function checkWarning(tokenAddress: string, chainId?: number | null) {
  if (tokenAddress === NATIVE_CHAIN_ID || tokenAddress === ZERO_ADDRESS) {
    return null
  }
  switch (tokenSafetyLookup.checkToken(tokenAddress.toLowerCase(), chainId)) {
    case TOKEN_LIST_TYPES.UNI_DEFAULT:
      return null
    case TOKEN_LIST_TYPES.UNI_EXTENDED:
      return MediumWarning
    case TOKEN_LIST_TYPES.UNKNOWN:
      return StrongWarning
    case TOKEN_LIST_TYPES.BROKEN:
      return StrongWarning
  }
}

export function displayWarningLabel(warning: Warning | null) {
  return warning && warning.level !== WARNING_LEVEL.MEDIUM
}
