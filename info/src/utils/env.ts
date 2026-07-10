/** 是否为线上生产环境（REACT_APP_ENV=prod 或 production） */
export function isProdEnv(): boolean {
  const env = process.env.REACT_APP_ENV?.toLowerCase()
  return env === 'prod' || env === 'production'
}

export function getSanityProjectId(): string {
  return process.env.REACT_APP_SANITY_PROJECT_ID ?? ''
}

export function getSanityDataset(): string {
  return process.env.REACT_APP_SANITY_DATASET ?? 'mainnet'
}

export function getSanityAuthToken(): string | undefined {
  const token = process.env.REACT_APP_SANITY_AUTH_TOKEN?.trim()
  return token || undefined
}
