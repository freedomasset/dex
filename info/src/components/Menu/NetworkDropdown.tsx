import { RowFixed, RowBetween } from 'components/Row'
import { getChainPriority, isInfoTestnetChainId } from 'constants/chains'
import { INFO_INTERFACE_NETWORKS, NetworkInfo } from 'constants/networks'
import useTheme from 'hooks/useTheme'
import React, { useState, useRef, useMemo, useEffect } from 'react'
import { useActiveNetworkVersion } from 'state/application/hooks'
import styled from 'styled-components'
import { TYPE } from 'theme'
import { useOnClickOutside } from 'hooks/useOnClickOutside'
import { AutoColumn } from 'components/Column'
import downArrowIcon from '../../assets/images/simpleFlow/downIcon.webp'
import { Check } from 'react-feather'
import { useTranslation } from 'react-i18next'
import { isProdEnv } from 'utils/getNetworkByEnv'

const SHOW_TESTNETS_KEY = 'freedomasset_info_show_testnets'

const Container = styled.div`
  position: relative;
  z-index: 40;
`

const Wrapper = styled.div`
  border-radius: 12px;
  background-color: ${({ theme }) => theme.bg1};
  padding: 6px 8px;
  margin-right: 12px;

  :hover {
    cursor: pointer;
    opacity: 0.7;
  }
`

const LogoWrapper = styled.img`
  width: 20px;
  height: 20px;
`

const FlyOut = styled.div`
  background-color: ${({ theme }) => theme.bg1};
  position: absolute;
  top: 40px;
  left: 0;
  border-radius: 12px;
  padding: 12px;
  width: 300px;
`

const SearchInput = styled.input`
  width: 100%;
  margin: 0 0 8px;
  padding: 8px 10px;
  border-radius: 10px;
  border: 1px solid ${({ theme }) => theme.bg3};
  background: ${({ theme }) => theme.bg2};
  color: ${({ theme }) => theme.white};
  font-size: 14px;
  outline: none;
`

const TestnetToggleRow = styled(RowBetween)`
  padding: 4px 4px 8px;
  margin-bottom: 4px;
  border-bottom: 1px solid ${({ theme }) => theme.bg3};
`

const TestnetCheckbox = styled.input`
  cursor: pointer;
  width: 16px;
  height: 16px;
`

const NetworkRow = styled(RowBetween)<{ $active?: boolean; disabled?: boolean }>`
  padding: 10px 12px;
  background-color: ${({ theme, $active }) => ($active ? theme.bg2 : theme.bg1)};
  border-radius: 8px;
  opacity: ${({ disabled }) => (disabled ? '0.45' : 1)};
  :hover {
    cursor: ${({ disabled }) => (disabled ? 'initial' : 'pointer')};
    opacity: ${({ disabled }) => (disabled ? 0.45 : 0.85)};
  }
`

export default function NetworkDropdown() {
  const [activeNetwork, setActiveNetwork] = useActiveNetworkVersion()
  const theme = useTheme()
  const { t } = useTranslation()
  const [showMenu, setShowMenu] = useState(false)
  const [chainSearch, setChainSearch] = useState('')

  const isProd = isProdEnv()

  const [showTestnetsState, setShowTestnetsState] = useState(() => {
    try {
      return localStorage.getItem(SHOW_TESTNETS_KEY) === 'true'
    } catch {
      return false
    }
  })

  const showTestnets = isProd ? false : showTestnetsState

  const setShowTestnets = (v: boolean) => {
    setShowTestnetsState(v)
    try {
      localStorage.setItem(SHOW_TESTNETS_KEY, v ? 'true' : 'false')
    } catch {
      /* ignore */
    }
  }

  const firstMainnet = useMemo(
    () => INFO_INTERFACE_NETWORKS.find((n) => !isInfoTestnetChainId(n.chainId)) ?? INFO_INTERFACE_NETWORKS[0],
    [],
  )

  const visibleNetworks = useMemo(() => {
    return INFO_INTERFACE_NETWORKS.filter((n) => {
      if (!showTestnets && isInfoTestnetChainId(n.chainId)) return false
      if (!chainSearch.trim()) return true
      const q = chainSearch.trim().toLowerCase()
      return n.name.toLowerCase().includes(q) || String(n.chainId).includes(q)
    }).sort((a, b) => getChainPriority(a.chainId) - getChainPriority(b.chainId))
  }, [showTestnets, chainSearch])

  useEffect(() => {
    if (!showTestnets && isInfoTestnetChainId(activeNetwork.chainId)) {
      setActiveNetwork(firstMainnet)
    }
  }, [showTestnets, activeNetwork.chainId, firstMainnet, setActiveNetwork])

  const node = useRef<HTMLDivElement>(null)
  useOnClickOutside(node, () => setShowMenu(false))

  const handleSelectNetwork = (n: NetworkInfo) => {
    setActiveNetwork(n)
    setChainSearch('')
    setShowMenu(false)
  }

  return (
    <Container ref={node}>
      <Wrapper onClick={() => setShowMenu(!showMenu)} style={{ background: '#222222' }}>
        <RowFixed>
          <LogoWrapper src={activeNetwork.imageURL} />
          <TYPE.main fontSize="14px" color={theme?.white} ml="8px" mt="-2px" mr="2px" style={{ whiteSpace: 'nowrap' }}>
            {activeNetwork.name}
          </TYPE.main>
          <img src={downArrowIcon} alt="downArrowIcon" style={{ marginLeft: '18px', width: '14px', height: '14px' }} />
        </RowFixed>
      </Wrapper>
      {showMenu && (
        <FlyOut>
          <SearchInput
            value={chainSearch}
            onChange={(e) => setChainSearch(e.target.value)}
            placeholder={t('searchNetworks')}
            aria-label={t('searchNetworks')}
          />
          {!isProd && (
            <TestnetToggleRow>
              <TYPE.main fontSize="13px" color={theme?.white}>
                {t('showTestnets')}
              </TYPE.main>
              <TestnetCheckbox
                type="checkbox"
                checked={showTestnets}
                onChange={(e) => setShowTestnets(e.target.checked)}
                aria-label={t('showTestnets')}
              />
            </TestnetToggleRow>
          )}
          <AutoColumn $gap="8px">
            {visibleNetworks.map((n) => (
              <NetworkRow key={n.id} onClick={() => handleSelectNetwork(n)} $active={activeNetwork.id === n.id}>
                <RowFixed>
                  <LogoWrapper src={n.imageURL} />
                  <TYPE.main ml="12px" color={theme?.white}>
                    {n.name}
                  </TYPE.main>
                </RowFixed>
                {activeNetwork.id === n.id ? <Check size={16} color="#00d1ff" /> : null}
              </NetworkRow>
            ))}
            <NetworkRow disabled>
              <TYPE.main color={theme?.text3}>{t('moreChainsComingSoon')}</TYPE.main>
            </NetworkRow>
          </AutoColumn>
        </FlyOut>
      )}
    </Container>
  )
}
