import React from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { darken } from 'polished'
import styled from 'styled-components'
import LogoDark from '../../assets/images/icon.svg'
import DatadexIcon from '../../assets/images/simpleFlow/datadex-icon.webp'
import DatadexLogo from '../../assets/images/simpleFlow/datadex-icon.webp'
import Menu from '../Menu'
import Row, { RowFixed, RowBetween } from '../Row'
import SearchSmall from 'components/Search'
import LanguageDropdown from 'components/Menu/LanguageDropdown'
import NetworkDropdown from 'components/Menu/NetworkDropdown'
import { useActiveNetworkVersion } from 'state/application/hooks'
import { AutoColumn } from 'components/Column'

const HeaderFrame = styled.div`
  display: grid;
  grid-template-columns: 1fr 120px;
  align-items: center;
  justify-content: space-between;
  align-items: center;
  flex-direction: row;
  width: 100%;
  height: 72px;
  top: 0;
  position: relative;
  padding: 0px 12px;
  z-index: 2;

  background-color: #161616;

  @media (max-width: 1080px) {
    grid-template-columns: 1fr;
    padding: 0.5rem 1rem;
    width: calc(100%);
    position: relative;
  }

  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
    padding: 0.5rem 1rem;
  `}
`

const HeaderControls = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-self: flex-end;

  @media (max-width: 1080px) {
    display: none;
  }
`

const HeaderRow = styled(RowFixed)`
  height: 32px;
  @media (max-width: 1080px) {
    width: 100%;
  }
`

const HeaderLinks = styled(Row)`
  justify-content: center;
  @media (max-width: 1080px) {
    padding: 0.5rem;
    justify-content: flex-end;
  }
`

const Title = styled(NavLink)`
  display: flex;
  align-items: center;
  pointer-events: auto;
  justify-self: flex-start;
  margin-right: 12px;
  :hover {
    cursor: pointer;
  }
  ${({ theme }) => theme.mediaWidth.upToSmall`
    justify-self: center;
  `};
`

const UniIcon = styled.div`
  display: none;
  transition: all 0.2s ease;
  :hover {
    transform: rotate(-5deg);
  }
  ${({ theme }) => theme.mediaWidth.upToSmall`
    display: block;
  `};
`

const UniLogo = styled.div`
  display: block;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  :hover {
    transform: rotate(-2deg);
  }
  ${({ theme }) => theme.mediaWidth.upToSmall`
    display: none;
  `};
`

const StyledNavLink = styled(NavLink)<{ $isActive: boolean }>`
  ${({ theme }) => theme.flexRowNoWrap}
  align-items: left;
  border-radius: 3rem;
  outline: none;
  cursor: pointer;
  text-decoration: none;
  font-size: 1rem;
  width: fit-content;
  margin: 0 6px;
  padding: 8px 12px;
  font-weight: 500;
  transition: color 0.2s ease, background-color 0.2s ease;

  border-radius: ${({ $isActive }) => ($isActive ? '12px' : 'unset')};
  color: ${({ theme, $isActive }) => ($isActive ? '#fff' : '#7E98A7')};
  &:hover {
    border-radius: 12px;
    background-color: #99a1bd14 !important;
  }

`

export const StyledMenuButton = styled.button`
  position: relative;
  width: 100%;
  height: 100%;
  border: none;
  background-color: transparent;
  margin: 0;
  padding: 0;
  height: 35px;
  background-color: ${({ theme }) => theme.bg3};
  margin-left: 8px;
  padding: 0.15rem 0.5rem;
  border-radius: 0.5rem;

  :hover,
  :focus {
    cursor: pointer;
    outline: none;
    background-color: ${({ theme }) => theme.bg4};
  }

  svg {
    margin-top: 2px;
  }

  > * {
    stroke: ${({ theme }) => theme.text1};
  }
`

const SmallContentGrouping = styled.div`
  width: 100%;
  display: none;
  @media (max-width: 1080px) {
    display: initial;
  }
`

export default function Header() {
  const [activeNewtork] = useActiveNetworkVersion()
  const { t } = useTranslation()
  const { pathname, search } = useLocation()

  const navTo = React.useMemo(
    () => ({
      home: { pathname: '/', search },
      pools: { pathname: '/pools', search },
      tokens: { pathname: '/tokens', search },
    }),
    [search]
  )

  return (
    <HeaderFrame>
      <HeaderRow>
        <Title to={navTo.home} style={{ textDecoration: 'none' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', }}>
            <UniLogo>
              <img height={'31px'} src={DatadexLogo} alt="logo" />
            </UniLogo>
            <UniIcon>
              <img width={'31px'} src={DatadexIcon} alt="logo" />
            </UniIcon>
            <span style={{ fontSize: '16px', color: '#fff', display: 'inline-block', width: '130px' }}>Freedom Asset</span>
          </div>
        </Title>
        <HeaderLinks>
          <StyledNavLink id={`pool-nav-link`} to={navTo.home} $isActive={pathname === '/'}>
            {t('overview')}
          </StyledNavLink>
          <StyledNavLink
            id={`stake-nav-link`}
            to={navTo.pools}
            $isActive={pathname.includes('pools')}
          >
            {t('pools')}
          </StyledNavLink>
          <StyledNavLink
            id={`stake-nav-link`}
            to={navTo.tokens}
            $isActive={pathname.includes('tokens')}
          >
            {t('tokens')}
          </StyledNavLink>
          {/* <Menu /> */}
        </HeaderLinks>
      </HeaderRow>
      <HeaderControls>
        <NetworkDropdown />
        <SearchSmall />
        <LanguageDropdown />
      </HeaderControls>
      <SmallContentGrouping>
        <AutoColumn $gap="sm">
          <RowBetween>
            <NetworkDropdown />
            <LanguageDropdown />
            {/* <Menu /> */}
          </RowBetween>
          <SearchSmall />
        </AutoColumn>
      </SmallContentGrouping>
    </HeaderFrame>
  )
}
