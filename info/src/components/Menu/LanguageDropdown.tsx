import React, { useRef, useState, useEffect } from 'react'
import styled from 'styled-components'
import { useTranslation } from 'react-i18next'
import { useOnClickOutside } from '../../hooks/useOnClickOutside'
import { AutoColumn } from '../Column'
import { RowFixed } from '../Row'
import { TYPE } from '../../theme'
import { SUPPORTED_LANGUAGES, SupportedLanguage } from '../../i18n'
import i18n from '../../i18n'
import useTheme from '../../hooks/useTheme'
import downArrowIcon from '../../assets/images/simpleFlow/downIcon.webp'
import setting from './imgs/setting.png'

const Container = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`

const Wrapper = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: ${({ theme }) => theme.bg3};
  color: #7E98A7;
  padding: 0;
  border-radius: 0.5rem;
  border: none;
  cursor: pointer;
  font-size: 16px;
  height: 35px;
  flex-shrink: 0;
  border-radius: 50%;
  margin-left: 12px;
  &:hover,
  &:focus {
    color: #fff;
    outline: none;
  }
`

const FlyOut = styled.span`
  min-width: 150px;
  background-color: ${({ theme }) => theme.bg3};
  box-shadow:
    0px 0px 1px rgba(0, 0, 0, 0.01),
    0px 4px 8px rgba(0, 0, 0, 0.04),
    0px 16px 24px rgba(0, 0, 0, 0.04),
    0px 24px 32px rgba(0, 0, 0, 0.01);
  border-radius: 12px;
  padding: 0.5rem;
  display: flex;
  flex-direction: column;
  font-size: 1rem;
  position: absolute;
  top: 2.6rem;
  right: 0rem;
  z-index: 1000;
`

const LanguageRow = styled.div<{ active: boolean }>`
  padding: 0.5rem;
  display: flex;
  align-items: center;
  cursor: pointer;
  border-radius: 8px;
  background-color: ${({ active, theme }) => (active ? theme.bg2 : 'transparent')};
  
  &:hover {
    background-color: ${({ theme }) => theme.bg2};
  }
`

const GreenDot = styled.div`
  height: 8px;
  width: 8px;
  background-color: #27ae60;
  border-radius: 50%;
  position: absolute;
  right: 0;
  top: 0;
  transform: translate(100%, -50%);
`

const LogaContainer = styled.div`
  position: relative;
  margin-right: 8px;
`

export default function LanguageDropdown() {
  const theme = useTheme()
  const { t } = useTranslation() 
  const node = useRef<HTMLDivElement>(null)
  const [showMenu, setShowMenu] = useState(false)
  // 使用 i18next 实例获取当前语言
  const [currentLanguage, setCurrentLanguage] = useState<SupportedLanguage>(() => {
    const lang = i18n.language || 'en'
    // 处理语言代码，例如 'zh-CN' 或 'zh' -> 'zh-CN'
    if (lang.startsWith('zh')) {
      return lang.includes('TW') || lang.includes('HK') || lang.includes('MO') ? 'zh-TW' : 'zh-CN'
    }
    return (lang as SupportedLanguage) || 'en'
  })

  useOnClickOutside(node, showMenu ? () => setShowMenu(false) : undefined)

  // 监听语言变化
  useEffect(() => {
    const handleLanguageChanged = (lng: string) => {
      // 处理语言代码
      let normalizedLang: SupportedLanguage = 'en'
      if (lng.startsWith('zh')) {
        normalizedLang = lng.includes('TW') || lng.includes('HK') || lng.includes('MO') ? 'zh-TW' : 'zh-CN'
      } else if (lng === 'en' || lng === 'zh-CN' || lng === 'zh-TW') {
        normalizedLang = lng as SupportedLanguage
      }
      setCurrentLanguage(normalizedLang)
    }

    i18n.on('languageChanged', handleLanguageChanged)

    return () => {
      i18n.off('languageChanged', handleLanguageChanged)
    }
  }, [])

  const handleLanguageChange = (langCode: SupportedLanguage) => {
    i18n.changeLanguage(langCode)
    setShowMenu(false)
  }

  const currentLangName = SUPPORTED_LANGUAGES.find((lang) => lang.code === currentLanguage)?.name || 'English'

  return (
    <Container ref={node}>
      <Wrapper onClick={() => setShowMenu(!showMenu)}>
        {/* {currentLangName} */}
        <img src={setting} alt="setting" style={{ width: '40px', height: '40px' }} />
      </Wrapper>
      {showMenu && (
        <FlyOut>
          <AutoColumn $gap="8px">
            <TYPE.main color={theme?.text3} fontWeight={600} fontSize="16px">
              {t('selectLanguage')}
            </TYPE.main>
            {SUPPORTED_LANGUAGES.map((lang) => {
              const isActive = currentLanguage === lang.code
              return (
                <LanguageRow
                  key={lang.code}
                  onClick={() => handleLanguageChange(lang.code)}
                  active={isActive}
                >
                  <RowFixed>
                    <LogaContainer>
                      {isActive && <GreenDot />}
                    </LogaContainer>
                    <TYPE.main ml="12px" color={theme?.white}>
                      {lang.name}
                    </TYPE.main>
                  </RowFixed>
                </LanguageRow>
              )
            })}
          </AutoColumn>
        </FlyOut>
      )}
    </Container>
  )
}
