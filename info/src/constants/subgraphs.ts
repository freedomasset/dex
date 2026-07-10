/** BSC 主网：Freedom Graph（与链上 V3 部署配套） */
export const BSC_SUBGRAPH_HTTP = {
  v3: 'https://graph.freedomasset.global/subgraphs/name/uniswap-v3-bsc',
  tokens: 'https://graph.freedomasset.global/subgraphs/name/v3-tokens-bsc',
  blocks: 'https://graph.freedomasset.global/subgraphs/name/blocklytics/bsc-blocks',
} as const

/** Ethereum 主网：Freedom Graph */
export const ETH_SUBGRAPH_HTTP = {
  v3: 'https://graph.freedomasset.global/subgraphs/name/uniswap-v3-ethereum',
  blocks: 'https://graph.freedomasset.global/subgraphs/name/blocklytics/ethereum-blocks',
} as const

/** Polygon 主网：Freedom Graph */
export const POLYGON_SUBGRAPH_HTTP = {
  v3: 'https://graph.freedomasset.global/subgraphs/name/uniswap-v3-polygon',
  blocks: 'https://graph.freedomasset.global/subgraphs/name/blocklytics/polygon-blocks',
} as const
