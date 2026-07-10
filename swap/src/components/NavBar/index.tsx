import { Trans } from '@lingui/macro'
import { ChainId } from '@vanadex/sdk-core'
import { useAccountDrawer } from 'components/AccountDrawer'
import Web3Status from 'components/Web3Status'
import { getAppChainId, getChainParamFromChainId, TT_CHAIN_MAINNET_ID, TT_CHAIN_TESTNET_ID } from 'constants/chains'
import useInterfaceChainId from 'hooks/useInterfaceChainId'
import { useIsPoolsPage } from 'hooks/useIsPoolsPage'
import useRedirectOnChainChange from 'hooks/useRedirectOnChainChange'
import useSyncChainQuery from 'hooks/useSyncChainQuery'
import { Box } from 'nft/components/Box'
import { Row } from 'nft/components/Flex'
import { VanaDarkIcon } from 'nft/components/icons'
import { ReactNode, useCallback } from 'react'
import { NavLink, NavLinkProps, useLocation, useNavigate } from 'react-router-dom'
import styled from 'styled-components'
import { useIsDarkMode } from 'theme/components/ThemeToggle'
import { ensureHashRouterQueryParam, mergeRouterSearch } from 'utils/withPreservedRouterSearch'

import TTChainIcon from '../../assets/images/simpleFlow/icon.png'
import SmallTTChainIcon from '../../assets/images/simpleFlow/smallIcon.png'
import { useIsMobile } from '../../nft/hooks'
import { useIsNavSearchInputVisible } from '../../nft/hooks/useIsNavSearchInputVisible'
import Blur from './Blur'
import { ChainSelector } from './ChainSelector'
import * as styles from './style.css'

const Nav = styled.nav`
  padding: ${({ theme }) => `${theme.navVerticalPad}px 12px`};
  width: 100%;
  height: ${({ theme }) => theme.navHeight}px;
  background-color: #161616;
  z-index: 2;

  @media only screen and (max-width: ${({ theme }) => `${theme.breakpoint.lg}px`}) {
    height: auto;
    min-height: ${({ theme }) => theme.navHeight}px;
  }
`

const NavContainer = styled.div`
  display: flex;
  height: 100%;
  flex-wrap: nowrap;

  @media only screen and (max-width: ${({ theme }) => `${theme.breakpoint.lg}px`}) {
    flex-wrap: wrap;
  }
`

const Web3StatusWrapper = styled.div`
  @media only screen and (max-width: ${({ theme }) => `${theme.breakpoint.lg}px`}) {
    width: 100%;
    display: flex;
    justify-content: flex-end;
  }
`

interface MenuItemProps {
  href: string
  id?: NavLinkProps['id']
  isActive?: boolean
  children: ReactNode
  dataTestId?: string
}

const FREEDOM_ASSET_X_URL = 'https://x.com/freedomassett'

const getInfoUrl = (chainId: number | undefined) => {
  const baseUrl = 'https://dashboard.freedomasset.global'
  if (!chainId) return baseUrl
  switch (chainId) {
    case 1480:
      return `${baseUrl}/#/vana`
    case 14800:
      return `${baseUrl}/#/vana-moksha`
    case TT_CHAIN_TESTNET_ID:
      // TT Chain 测试网看板（HashRouter：`/#/?chain=…`）
      return 'https://dashboard-testnet.freedomasset.global/#/'
    case ChainId.SEPOLIA:
      return 'https://dashboard-testnet.freedomasset.global/#/'
    case TT_CHAIN_MAINNET_ID:
      // TT Chain 主网看板
      return 'https://dashboard.freedomasset.global/#/'
    default:
      return baseUrl
  }
}

const MenuItem = ({ href, dataTestId, id, isActive, children }: MenuItemProps) => {
  return (
    <NavLink
      to={href}
      className={isActive ? styles.activeMenuItem : styles.menuItem}
      id={id}
      style={{ textDecoration: 'none', overflow: 'hidden', whiteSpace: 'nowrap', margin: '0 6px' }}
      data-testid={dataTestId}
    >
      {children}
    </NavLink>
  )
}

// Add ExternalMenuItem component
const ExternalMenuItem = ({ href, children }: { href: string; children: ReactNode }) => {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={styles.menuItem}
      style={{ textDecoration: 'none', overflow: 'hidden', whiteSpace: 'nowrap', margin: '0 6px' }}
    >
      {children} ↗
    </a>
  )
}

// eslint-disable-next-line import/no-unused-modules -- App.tsx: import { PageTabs } from 'components/NavBar'
export const PageTabs = () => {
  const { pathname, search } = useLocation()
  const isPoolActive = useIsPoolsPage()
  const interfaceChainId = useInterfaceChainId()
  const effectiveChainForInfo = interfaceChainId ?? getAppChainId()
  const infoUrlRaw = getInfoUrl(effectiveChainForInfo)
  const chainParam = getChainParamFromChainId(effectiveChainForInfo)
  const infoUrl = chainParam ? ensureHashRouterQueryParam(infoUrlRaw, 'chain', chainParam) : infoUrlRaw
  /** 保留 Hash 内查询参数（如 chain=polygon），避免切 Tab 后退回默认 TT 链 */
  const qs = search

  return (
    <>
      <MenuItem href={`/swap${qs}`} isActive={pathname.startsWith('/swap')}>
        <Trans>Swap</Trans>
      </MenuItem>
      <MenuItem href={`/pools${qs}`} dataTestId="pool-nav-link" isActive={isPoolActive}>
        <Trans>Pools</Trans>
      </MenuItem>
      <ExternalMenuItem href={infoUrl}>
        <Trans>Info</Trans>
      </ExternalMenuItem>
      <ExternalMenuItem href={FREEDOM_ASSET_X_URL}>
        <Trans id="nav.x">X</Trans>
      </ExternalMenuItem>
      {/* <ExternalMenuItem href="https://stargate.finance/bridge?srcChain=vana">
        <Trans>Bridge</Trans>
      </ExternalMenuItem>
      <Box marginY="4">
        <MenuDropdown />
      </Box> */}
    </>
  )
}

const Navbar = ({ blur }: { blur: boolean }) => {
  const { search } = useLocation()
  const navigate = useNavigate()
  const isNavSearchInputVisible = useIsNavSearchInputVisible()
  const [accountDrawerOpen, toggleAccountDrawer] = useAccountDrawer()
  const isDarkMode = useIsDarkMode()
  const isMobile = useIsMobile()
  useSyncChainQuery()
  useRedirectOnChainChange()

  const handleHorIconClick = useCallback(() => {
    if (accountDrawerOpen) {
      toggleAccountDrawer()
    }
    navigate({
      pathname: '/',
      search: mergeRouterSearch(search, { intro: 'true' }),
    })
  }, [accountDrawerOpen, navigate, toggleAccountDrawer, search])

  return (
    <>
      {blur && <Blur />}
      <Nav>
        <NavContainer>
          <Box className={styles.leftSideContainer}>
            <Box className={styles.logoContainer}>
              {isDarkMode ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <img
                    src={isMobile ? SmallTTChainIcon : TTChainIcon}
                    alt="Freedom Asset"
                    width={isMobile ? 40 : 40}
                    height={isMobile ? 40 : 40}
                    className={styles.logo}
                    onClick={handleHorIconClick}
                  />
                  <span>Freedom Asset</span>
                </div>
              ) : (
                // <VanaIcon width={109} height={36} className={styles.logo} onClick={handleHorIconClick} />
                <VanaDarkIcon width={109} height={36} className={styles.logo} onClick={handleHorIconClick} />
              )}
            </Box>
            {isMobile ? (
              <Web3StatusWrapper>
                <Row gap="10" style={{ width: '100%', justifyContent: 'flex-end' }}>
                  <ChainSelector />
                  <Web3Status />
                </Row>
              </Web3StatusWrapper>
            ) : null}
            <Row display={{ sm: 'none', lg: 'flex' }} style={{ height: '37px' }}>
              <PageTabs />
            </Row>
          </Box>
          {/* <Box
            className={styles.searchContainer}
            {...(isNavSearchInputVisible && {
              display: 'flex',
            })}
          ></Box> */}
          <Box className={styles.rightSideContainer}>
            <Row gap="16">
              <Box position="relative" display={isNavSearchInputVisible ? 'none' : { sm: 'flex' }}></Box>
              {isMobile ? null : (
                <>
                  <ChainSelector />
                  <Web3StatusWrapper>
                    <Web3Status />
                  </Web3StatusWrapper>
                </>
              )}
            </Row>
          </Box>
        </NavContainer>
      </Nav>
    </>
  )
}

// eslint-disable-next-line import/no-unused-modules -- App.tsx: import NavBar from 'components/NavBar'
export default Navbar
