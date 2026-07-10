import { ChainId } from '@vanadex/sdk-core'

/** Sepolia：Graph Node HTTP 端点（与链上 V3 部署配套） */
export const SEPOLIA_SUBGRAPH_HTTP = {
  v3: 'https://graph-testnet.freedomasset.global/subgraphs/name/uniswap-v3-sepolia',
  tokens: 'https://graph-testnet.freedomasset.global/subgraphs/name/v3-tokens-sepolia',
  blocks: 'https://graph-testnet.freedomasset.global/subgraphs/name/blocklytics/sepolia-blocks',
} as const

/** Sepolia 其余部署地址（Descriptor / Staker 等；前端核心流程未直接使用，供扩展与 info 集成） */
export const SEPOLIA_PERIPHERY_MISC = {
  proxyAdminAddress: '0xDf234Db51398D056E9c90Ee843Fc455FC25d7FD',
  tickLensAddress: '0x57506A4767B96328DDcB55561906e29a201EA449',
  nftDescriptorLibraryAddressV1_3_0: '0x59d9D6676946043dc791a9D808716493e62545f5',
  nonfungibleTokenPositionDescriptorAddressV1_3_0: '0xFE4A8bC1248aaE9cfa3F2cf69d24558d43d2F114',
  descriptorProxyAddress: '0xB50E8038710CBe4499100A2d51Cae4d02841f34d',
  v3StakerAddress: '0x75ccFb86018A4394e5538E5dcf57Cad8470D9A8E',
} as const

/** 按链索引的主要 V3 Subgraph（当前仅配置 Sepolia） */
export const CHAIN_V3_SUBGRAPH_URL: Partial<{ [chainId: number]: string }> = {
  [ChainId.SEPOLIA]: SEPOLIA_SUBGRAPH_HTTP.v3,
}
