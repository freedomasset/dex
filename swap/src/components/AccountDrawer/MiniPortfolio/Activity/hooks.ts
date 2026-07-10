import { usePendingTransactions } from 'state/transactions/hooks'

export function usePendingActivity() {
  const pendingTransactions = usePendingTransactions()

  const hasPendingActivity = pendingTransactions.length > 0
  const pendingActivityCount = pendingTransactions.length

  return { hasPendingActivity, pendingActivityCount }
}
