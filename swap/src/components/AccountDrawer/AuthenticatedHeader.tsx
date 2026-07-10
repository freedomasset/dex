import { useLingui } from '@lingui/react'
import { useWeb3React } from '@web3-react/core'
import { Power } from 'components/Icons/Power'
import { getConnection } from 'connection'
import useENSName from 'hooks/useENSName'
import { useCallback } from 'react'
import { useAppDispatch } from 'state/hooks'
import { updateSelectedWallet } from 'state/user/reducer'
import styled from 'styled-components'
import { CopyHelper, ThemedText } from 'theme/components'
import { shortenAddress } from 'utils'

import StatusIcon from '../Identicon/StatusIcon'
import { IconHoverText, IconWithConfirmTextButton } from './IconButton'

const AuthenticatedHeaderWrapper = styled.div`
  padding: 20px 16px;
  display: flex;
  flex-direction: column;
  flex: 1;
`

const IconContainer = styled.div`
  display: flex;
  align-items: center;
  & > a,
  & > button {
    margin-right: 8px;
  }

  & > button:last-child {
    margin-right: 0px;
    ${IconHoverText}:last-child {
      left: 0px;
    }
  }
`

const StatusWrapper = styled.div`
  display: inline-block;
  width: 70%;
  max-width: 70%;
  padding-right: 8px;
  display: inline-flex;
`

const AccountNamesWrapper = styled.div`
  overflow: hidden;
  white-space: nowrap;
  display: flex;
  width: 100%;
  flex-direction: column;
  justify-content: center;
  margin-left: 8px;
`

const HeaderWrapper = styled.div`
  margin-bottom: 20px;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
`

const CopyText = styled(CopyHelper).attrs({
  iconSize: 14,
  iconPosition: 'right',
})``

export default function AuthenticatedHeader({ account }: { account: string }) {
  const { i18n } = useLingui()
  const { connector } = useWeb3React()
  const disconnectLabel = i18n.locale === 'zh-CN' ? '断开连接' : i18n.locale === 'zh-TW' ? '斷開連接' : 'Disconnect'
  const { ENSName } = useENSName(account)
  const dispatch = useAppDispatch()

  const connection = getConnection(connector)
  const disconnect = useCallback(() => {
    if (connector && connector.deactivate) {
      connector.deactivate()
    }
    connector.resetState()
    dispatch(updateSelectedWallet({ wallet: undefined }))
  }, [connector, dispatch])

  return (
    <AuthenticatedHeaderWrapper>
      <HeaderWrapper>
        <StatusWrapper>
          <StatusIcon account={account} connection={connection} size={40} />
          {account && (
            <AccountNamesWrapper>
              <ThemedText.SubHeader>
                <CopyText toCopy={ENSName ?? account}>{ENSName ?? shortenAddress(account)}</CopyText>
              </ThemedText.SubHeader>
              {/* Displays smaller view of account if ENS name was rendered above */}
              {ENSName && (
                <ThemedText.BodySmall color="neutral2">
                  <CopyText toCopy={account}>{shortenAddress(account)}</CopyText>
                </ThemedText.BodySmall>
              )}
            </AccountNamesWrapper>
          )}
        </StatusWrapper>
        <IconContainer>
          <IconWithConfirmTextButton
            data-testid="wallet-disconnect"
            onConfirm={disconnect}
            Icon={Power}
            text={disconnectLabel}
            dismissOnHoverOut
          />
        </IconContainer>
      </HeaderWrapper>
    </AuthenticatedHeaderWrapper>
  )
}
