import { t } from '@lingui/macro'
import { nativeOnChain } from 'constants/tokens'

/** Friendly message when the wallet lacks native currency for gas (i18n). */
export function getInsufficientFundsUserMessage(chainId: number | undefined): string {
  if (chainId === undefined) {
    return t`Insufficient native token for network fees. Add more to your wallet and try again.`
  }
  try {
    const sym = nativeOnChain(chainId).symbol ?? 'ETH'
    return t`Insufficient ${sym} for network fees. Add more to your wallet and try again.`
  } catch {
    return t`Insufficient native token for network fees. Add more to your wallet and try again.`
  }
}
