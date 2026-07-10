import { Trans } from '@lingui/macro'
import { useLocationLinkProps } from 'hooks/useLocationLinkProps'
import { useMemo } from 'react'
import styled from 'styled-components'
import { StyledInternalLink, ThemedText } from 'theme/components'

import { DEFAULT_LOCALE, LOCALE_LABEL, SupportedLocale } from '../../constants/locales'
import { navigatorLocale, useActiveLocale } from '../../hooks/useActiveLocale'

const Container = styled(ThemedText.DeprecatedSmall)`
  opacity: ${({ theme }) => theme.opacity.hover};
  :hover {
    opacity: 1;
  }
  margin-top: 1rem !important;
`

const useTargetLocale = (activeLocale: SupportedLocale) => {
  const browserLocale = useMemo(() => navigatorLocale(), [])

  if (browserLocale && (browserLocale !== DEFAULT_LOCALE || activeLocale !== DEFAULT_LOCALE)) {
    if (activeLocale === browserLocale) {
      return DEFAULT_LOCALE
    } else {
      return browserLocale
    }
  }
  return null
}

const StyledCustomInternalLink = styled(StyledInternalLink)`
  color: #ffffff;
  &:hover {
    color: #ffffff;
    opacity: 1;
  }
  &:active {
    opacity: 1;
  }
`

export function SwitchLocaleLink() {
  const activeLocale = useActiveLocale()
  const targetLocale = useTargetLocale(activeLocale)

  const { to, onClick } = useLocationLinkProps(targetLocale)

  if (!targetLocale || !to) return null

  const translatedLocaleName =
    targetLocale === 'en-US' ? (
      <Trans id="English">English</Trans>
    ) : targetLocale === 'zh-CN' ? (
      <Trans id="Simplified Chinese">Simplified Chinese</Trans>
    ) : targetLocale === 'zh-TW' ? (
      <Trans id="Traditional Chinese">Traditional Chinese</Trans>
    ) : (
      LOCALE_LABEL[targetLocale]
    )

  return (
    <Container style={{ opacity: 1, fontSize: '14px' }}>
      <p>
        Freedom Asset <Trans id="available in">available in</Trans>：
        <StyledCustomInternalLink onClick={onClick} to={to}>
          {translatedLocaleName}
        </StyledCustomInternalLink>
      </p>
    </Container>
  )
}
