import { UserRejectedRequestError } from './errors'

function getReason(error: any): string | undefined {
  let reason: string | undefined
  while (error) {
    reason = error.reason ?? error.message ?? reason
    error = error.error ?? error.data?.originalError
  }
  return reason
}

/** 钱包/用户拒绝签名或交易（含 EIP-1193 与各插件文案） */
export function didUserReject(error: any): boolean {
  const reason = getReason(error)
  if (
    error?.code === 4001 ||
    error?.code === 'ACTION_REJECTED' ||
    (reason?.match(/request/i) && reason?.match(/reject/i)) ||
    reason?.match(/declined/i) ||
    reason?.match(/cancell?ed by user/i) ||
    reason?.match(/user cancell?ed/i) ||
    reason?.match(/user denied/i) ||
    reason?.match(/user rejected/i) ||
    error instanceof UserRejectedRequestError
  ) {
    return true
  }
  return false
}

/** 原生币不足以支付 gas（含 intrinsic transaction cost / INSUFFICIENT_FUNDS） */
export function isInsufficientFundsError(error: unknown): boolean {
  const walk = (e: any): boolean => {
    if (e == null || typeof e !== 'object') return false
    if (e.code === 'INSUFFICIENT_FUNDS') return true
    const msg = String(e.message ?? e.reason ?? '').toLowerCase()
    if (msg.includes('insufficient funds')) return true
    if (e.error) return walk(e.error)
    if (e.data?.originalError) return walk(e.data.originalError)
    return false
  }
  return walk(error as any)
}

export { getReason }
