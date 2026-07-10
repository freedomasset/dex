import React, { useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { BookOpen, Code, Info, MessageCircle } from 'react-feather'
import styled from 'styled-components'
import { ReactComponent as MenuIcon } from '../../assets/images/menu.svg'
import { useOnClickOutside } from '../../hooks/useOnClickOutside'

import { ExternalLink } from '../../theme'
import downArrowIcon from '../../assets/images/simpleFlow/downIcon.webp'
const StyledMenuIcon = styled(MenuIcon)`
  path {
    stroke: ${({ theme }) => theme.text1};
  }
`

const StyledMenuButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  border: none;
  background-color: transparent;
  margin: 0;
  padding: 0;
  height: 35px;
  background-color: ${({ theme }) => theme.bg3};
  color: #7E98A7;
  padding: 0.15rem 0.5rem;
  border-radius: 0.5rem;
  cursor: pointer;
  font-size: 16px;
  &:hover,
  &:focus {
    cursor: pointer;
    outline: none;
    color: #fff;
  }

  svg {
    margin-top: 2px;
  }
`

const StyledMenu = styled.div`
  margin-left: 0.5rem;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  border: none;
  text-align: left;
`

const MenuFlyout = styled.span`
  min-width: 8.125rem;
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

const MenuItem = styled(ExternalLink)`
  flex: 1;
  padding: 0.5rem 0.5rem;
  color: ${({ theme }) => theme.text2};
  :hover {
    color: ${({ theme }) => theme.text1};
    cursor: pointer;
    text-decoration: none;
    opacity: 0.6;
  }
  > svg {
    margin-right: 8px;
  }
`

const CODE_LINK = 'https://github.com/freedomasset/dex'

export default function Menu() {
  const { t } = useTranslation()
  const node = useRef<HTMLDivElement>(null)
  const [isOpen, setOpen] = useState(false)

  useOnClickOutside(node, isOpen ? () => setOpen(false) : undefined)

  return (
    <StyledMenu ref={node}>
      <StyledMenuButton onClick={() => setOpen((open) => !open)}>
        {t('resources')}
        {/* <StyledMenuIcon /> */}
        <img src={downArrowIcon} alt="downArrowIcon" style={{ marginLeft: '6px', width: '14px', height: '14px' }} />
      </StyledMenuButton>

      {isOpen && (
        <MenuFlyout>
          <MenuItem id="link" href="https://freedomasset.global/">
            <Info size={14} />
            {t('about')}
          </MenuItem>
          <MenuItem id="link" href="https://freedomasset.global/">
            <BookOpen size={14} />
            {t('docs')}
          </MenuItem>
          <MenuItem id="link" href={CODE_LINK}>
            <Code size={14} />
            {t('github')}
          </MenuItem>
          <MenuItem id="link" href="https://discord.gg/withvana">
            <MessageCircle size={14} />
            {t('discord')}
          </MenuItem>
        </MenuFlyout>
      )}
    </StyledMenu>
  )
}
