export function isTestEnv(): boolean {
  return process.env.NODE_ENV === 'test'
}

export function isStagingEnv(): boolean {
  // This is set in vercel builds and deploys from releases/staging.
  return Boolean(process.env.REACT_APP_STAGING)
}

export function isProductionEnv(): boolean {
  return process.env.NODE_ENV === 'production' && !isStagingEnv()
}

/** 是否为线上生产环境（REACT_APP_ENV=prod 或 REACT_APP_CHAIN=prod） */
export function isProdEnv(): boolean {
  const env = process.env.REACT_APP_ENV?.toLowerCase()
  if (env === 'prod' || env === 'production') return true
  return process.env.REACT_APP_CHAIN === 'prod'
}

/** WalletConnect Cloud project ID (required for WalletConnect). */
export function getWalletConnectProjectId(): string {
  return process.env.REACT_APP_WALLETCONNECT_PROJECT_ID ?? ''
}

/** Optional Ankr API key for higher-rate-limit RPC endpoints. */
export function getAnkrApiKey(): string | undefined {
  const key = process.env.REACT_APP_ANKR_API_KEY?.trim()
  return key || undefined
}

export function getAnkrRpcUrl(chain: string): string {
  const key = getAnkrApiKey()
  return key ? `https://rpc.ankr.com/${chain}/${key}` : `https://rpc.ankr.com/${chain}`
}
