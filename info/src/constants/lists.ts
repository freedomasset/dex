// used to mark unsupported tokens, these are hosted lists of unsupported tokens

export const UNSUPPORTED_LIST_URLS: string[] = []
export const OPTIMISM_LIST = 'https://static.optimism.io/optimism.tokenlist.json'
export const ARBITRUM_LIST = 'https://bridge.arbitrum.io/token-list-42161.json'
export const POLYGON_LIST =
  'https://unpkg.com/quickswap-default-token-list@1.2.2/build/quickswap-default.tokenlist.json'
export const CELO_LIST = 'https://celo-org.github.io/celo-token-list/celo.tokenlist.json'
export const BNB_LIST = 'https://raw.githubusercontent.com/plasmadlt/plasma-finance-token-list/master/bnb.json'
export const VANA_LIST =
  'https://raw.githubusercontent.com/centfinance/tokenlists/refs/heads/main/generated/datadex.tokenlist.json'

// lower index == higher priority for token import
// 只保留当前使用的列表，移除不需要的网络列表以避免不必要的请求
export const DEFAULT_LIST_OF_LISTS: string[] = [
  VANA_LIST,
  // OPTIMISM_LIST, // 已禁用，避免连接超时错误
  // ARBITRUM_LIST, // 已禁用
  // POLYGON_LIST, // 已禁用
  // CELO_LIST, // 已禁用
  // BNB_LIST, // 已禁用
  ...UNSUPPORTED_LIST_URLS, // need to load unsupported tokens as well
]

// default lists to be 'active' aka searched across
// 只保留当前使用的列表，移除不需要的网络列表以避免不必要的请求
export const DEFAULT_ACTIVE_LIST_URLS: string[] = [
  VANA_LIST,
  // OPTIMISM_LIST, // 已禁用，避免连接超时错误
  // ARBITRUM_LIST, // 已禁用
  // POLYGON_LIST, // 已禁用
  // CELO_LIST, // 已禁用
  // BNB_LIST, // 已禁用
]
