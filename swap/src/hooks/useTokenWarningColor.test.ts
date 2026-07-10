import { WARNING_LEVEL } from 'constants/tokenSafety'
import { renderHook } from 'test-utils/render'
import { lightTheme } from 'theme/colors'
import { lightDeprecatedTheme } from 'theme/deprecatedColors'

import { useTokenWarningColor, useTokenWarningTextColor } from './useTokenWarningColor'

describe('Token Warning Colors', () => {
  describe('useTokenWarningColor', () => {
    it('medium', () => {
      const { result } = renderHook(() => useTokenWarningColor(WARNING_LEVEL.MEDIUM))
      expect(result.current).toEqual(lightTheme.surface3)
    })

    it('strong', () => {
      const { result } = renderHook(() => useTokenWarningColor(WARNING_LEVEL.UNKNOWN))
      expect(result.current).toEqual(lightDeprecatedTheme.deprecated_accentFailureSoft)
    })
  })

  describe('useTokenWarningTextColor', () => {
    it('medium', () => {
      const { result } = renderHook(() => useTokenWarningTextColor(WARNING_LEVEL.MEDIUM))
      expect(result.current).toEqual(lightDeprecatedTheme.deprecated_accentWarning)
    })

    it('strong', () => {
      const { result } = renderHook(() => useTokenWarningTextColor(WARNING_LEVEL.UNKNOWN))
      expect(result.current).toEqual(lightTheme.critical)
    })
  })
})
