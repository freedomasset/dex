import { t, Trans } from '@lingui/macro'
import { ChainId } from '@vanadex/sdk-core'
import { useWeb3React } from '@web3-react/core'
import { showTestnetsAtom } from 'components/AccountDrawer/TestnetsToggle'
import { MouseoverTooltip } from 'components/Tooltip'
import { getChainInfo } from 'constants/chainInfo'
import {
  getChainParamFromChainId,
  getChainPriority,
  INTERFACE_SUPPORTED_CHAIN_IDS,
  TESTNET_CHAIN_IDS,
} from 'constants/chains'
import useInterfaceChainId from 'hooks/useInterfaceChainId'
import { useOnClickOutside } from 'hooks/useOnClickOutside'
import useParsedQueryString from 'hooks/useParsedQueryString'
import { useAtomValue } from 'jotai'
import { Box } from 'nft/components/Box'
import { Portal } from 'nft/components/common/Portal'
import { Column, Row } from 'nft/components/Flex'
import { useIsMobile } from 'nft/hooks'
import { ParsedQs } from 'qs'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { AlertTriangle } from 'react-feather'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAppSelector } from 'state/hooks'
import styled, { useTheme } from 'styled-components'
import { buildCleanSwapSearch, shouldResetRouteOnChainChange } from 'utils/chainNavigation'
import { isProdEnv } from 'utils/env'

import downArrowIcon from '../../assets/images/simpleFlow/downIcon.webp'
import * as styles from './ChainSelector.css'
import ChainSelectorRow from './ChainSelectorRow'
import { NavDropdown } from './NavDropdown'

const ComingSoonRow = styled.div`
  padding: 12px 8px;
  margin-top: 4px;
  border-top: 1px solid ${({ theme }) => theme.surface3};
  color: ${({ theme }) => theme.neutral2};
  font-size: 14px;
  font-weight: 485;
  opacity: 0.45;
  cursor: not-allowed;
  user-select: none;
  white-space: nowrap;
`

const SearchInput = styled.input`
  width: 100%;
  margin: 8px 0 4px;
  padding: 8px 10px;
  border-radius: 10px;
  border: 1px solid ${({ theme }) => theme.surface3};
  background: ${({ theme }) => theme.surface1};
  color: ${({ theme }) => theme.neutral1};
  font-size: 14px;
  outline: none;
`

function buildSearchWithChain(chainParam: string, currentQs: ParsedQs): string {
  const params = new URLSearchParams()
  for (const [key, value] of Object.entries(currentQs)) {
    if (key === 'chain') continue
    if (typeof value === 'string' && value.length > 0) {
      params.set(key, value)
    }
  }
  params.set('chain', chainParam)
  return `?${params.toString()}`
}

/** 选择器中列出的链均支持钱包切换（RPC 已在 useSwitchChain 覆盖） */
function useWalletSupportedChains(): ChainId[] {
  return INTERFACE_SUPPORTED_CHAIN_IDS
}

interface ChainSelectorProps {
  leftAlign?: boolean
}

export const ChainSelector = ({ leftAlign }: ChainSelectorProps) => {
  const { chainId: walletChainId, account } = useWeb3React()
  const interfaceChainId = useInterfaceChainId()
  const [isOpen, setIsOpen] = useState<boolean>(false)
  const isMobile = useIsMobile()
  const theme = useTheme()
  const navigate = useNavigate()
  const location = useLocation()
  const parsedQs = useParsedQueryString()

  const showTestnetsPref = useAtomValue(showTestnetsAtom)
  const showTestnets = isProdEnv() ? false : showTestnetsPref
  const walletSupportsChain = useWalletSupportedChains()
  const [chainSearch, setChainSearch] = useState('')

  const [supportedChains, unsupportedChains] = useMemo(() => {
    const { supported, unsupported } = INTERFACE_SUPPORTED_CHAIN_IDS.filter((chain: number) => {
      return showTestnets || !TESTNET_CHAIN_IDS.includes(chain)
    })
      .filter((chain) => {
        if (!chainSearch.trim()) return true
        const label = getChainInfo(chain)?.label?.toLowerCase() ?? ''
        return label.includes(chainSearch.trim().toLowerCase())
      })
      .sort((a, b) => getChainPriority(a) - getChainPriority(b))
      .reduce(
        (acc, chain) => {
          if (walletSupportsChain.includes(chain)) {
            acc.supported.push(chain)
          } else {
            acc.unsupported.push(chain)
          }
          return acc
        },
        { supported: [] as ChainId[], unsupported: [] as ChainId[] }
      )
    return [supported, unsupported]
  }, [showTestnets, walletSupportsChain, chainSearch])

  const ref = useRef<HTMLDivElement>(null)
  const modalRef = useRef<HTMLDivElement>(null)
  useOnClickOutside(ref, () => setIsOpen(false), [modalRef])

  const displayChainId = interfaceChainId ?? walletChainId
  const info = displayChainId !== undefined ? getChainInfo(displayChainId) : undefined

  const switchingChain = useAppSelector((state) => state.wallets.switchingChain)
  const prevSwitchingRef = useRef(false)

  const [pendingChainId, setPendingChainId] = useState<ChainId | undefined>(undefined)

  /** 切链由 URL 同步逻辑 useSyncChainQuery 统一触发，此处只改路由，避免对钱包连发两次 switch/addChain */
  const onSelectChain = useCallback(
    (targetChainId: ChainId) => {
      const param = getChainParamFromChainId(targetChainId)
      if (!param) return

      setPendingChainId(targetChainId)
      setChainSearch('')

      const resetRoute = shouldResetRouteOnChainChange(location.pathname, parsedQs)
      navigate({
        pathname: resetRoute ? '/swap' : location.pathname,
        search: resetRoute ? buildCleanSwapSearch(targetChainId, parsedQs) : buildSearchWithChain(param, parsedQs),
      })
      setIsOpen(false)
    },
    [navigate, location.pathname, parsedQs]
  )

  useEffect(() => {
    if (pendingChainId === undefined) {
      prevSwitchingRef.current = Boolean(switchingChain)
      return
    }
    if (walletChainId !== undefined && walletChainId === pendingChainId) {
      setPendingChainId(undefined)
      prevSwitchingRef.current = Boolean(switchingChain)
      return
    }
    const wasSwitching = prevSwitchingRef.current
    const nowSwitching = Boolean(switchingChain)
    if (wasSwitching && !nowSwitching && walletChainId !== pendingChainId) {
      setPendingChainId(undefined)
    }
    prevSwitchingRef.current = nowSwitching
  }, [pendingChainId, walletChainId, switchingChain])

  const walletMismatch = Boolean(
    account && walletChainId !== undefined && interfaceChainId !== undefined && walletChainId !== interfaceChainId
  )

  if (displayChainId === undefined || !info) {
    return null
  }

  const isSupported = !!info

  const dropdown = (
    <NavDropdown top="56" left={leftAlign ? '0' : 'auto'} right={leftAlign ? 'auto' : '0'} ref={modalRef}>
      <Column paddingX="8" data-testid="chain-selector-options">
        <SearchInput
          type="search"
          placeholder={t({ id: 'nav.search_networks', message: 'Search networks' })}
          value={chainSearch}
          onChange={(e) => setChainSearch(e.target.value)}
          aria-label={t({ id: 'nav.search_networks', message: 'Search networks' })}
        />
        {supportedChains.map((selectorChain) => (
          <ChainSelectorRow
            disabled={!walletSupportsChain.includes(selectorChain)}
            onSelectChain={onSelectChain}
            targetChain={selectorChain}
            key={selectorChain}
            isPending={selectorChain === pendingChainId}
            selectedChainId={interfaceChainId}
          />
        ))}
        {unsupportedChains.map((selectorChain) => (
          <ChainSelectorRow
            disabled
            onSelectChain={() => undefined}
            targetChain={selectorChain}
            key={selectorChain}
            isPending={false}
            selectedChainId={interfaceChainId}
          />
        ))}
        <ComingSoonRow data-testid="chain-selector-coming-soon">
          <Trans id="nav.chains_coming_soon">More chains coming soon</Trans>
        </ComingSoonRow>
      </Column>
    </NavDropdown>
  )

  const tooltipText = walletMismatch
    ? t`Wallet network does not match the selected network. Switch network in your wallet or pick the matching network here.`
    : t`Your wallet's current network is unsupported.`

  return (
    <Box position="relative" ref={ref}>
      <MouseoverTooltip text={tooltipText} disabled={isSupported && !walletMismatch}>
        <Row
          data-testid="chain-selector"
          as="button"
          gap="8"
          style={{ backgroundColor: '#222222', borderRadius: '20px', height: '40px', padding: '0 8px' }}
          className={styles.ChainSelector}
          background={isOpen ? 'accent2' : 'none'}
          onClick={() => setIsOpen(!isOpen)}
        >
          {!isSupported || walletMismatch ? (
            <AlertTriangle size={20} color={theme.neutral2} />
          ) : (
            <img src={info.logoUrl} alt={info.label} className={styles.Image} data-testid="chain-selector-logo" />
          )}
          <div style={{ whiteSpace: 'nowrap', width: 'auto' }}>{info?.label}</div>
          <img src={downArrowIcon} alt="downArrowIcon" style={{ marginLeft: '18px', width: '14px', height: '14px' }} />
        </Row>
      </MouseoverTooltip>
      {isOpen && (isMobile ? <Portal>{dropdown}</Portal> : <>{dropdown}</>)}
    </Box>
  )
}
