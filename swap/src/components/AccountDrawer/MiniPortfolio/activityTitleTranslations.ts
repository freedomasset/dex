/**
 * Activity 标题中英对照，用于弹窗等展示时按当前语言显示。
 * 与 constants.tsx 中 TransactionTitleTable / CancelledTransactionTitleTable / AlternateTransactionTitleTable 的文案一一对应。
 */
// eslint-disable-next-line import/no-unused-modules -- 被 getTranslatedActivityTitle 内部使用
export const ACTIVITY_TITLE_ZH: Record<string, { 'zh-CN': string; 'zh-TW': string }> = {
  // TransactionTitleTable - SWAP
  Swapping: { 'zh-CN': '交换中', 'zh-TW': '交換中' },
  Swapped: { 'zh-CN': '已交换', 'zh-TW': '已交換' },
  'Swap failed': { 'zh-CN': '交换失败', 'zh-TW': '交換失敗' },
  // WRAP
  Wrapping: { 'zh-CN': '包装中', 'zh-TW': '包裝中' },
  Wrapped: { 'zh-CN': '已包装', 'zh-TW': '已包裝' },
  'Wrap failed': { 'zh-CN': '包装失败', 'zh-TW': '包裝失敗' },
  Unwrapping: { 'zh-CN': '解包中', 'zh-TW': '解包中' },
  Unwrapped: { 'zh-CN': '已解包', 'zh-TW': '已解包' },
  'Unwrap failed': { 'zh-CN': '解包失败', 'zh-TW': '解包失敗' },
  // ADD_LIQUIDITY_V3_POOL
  'Adding liquidity': { 'zh-CN': '添加流动性中', 'zh-TW': '添加流動性中' },
  'Added liquidity': { 'zh-CN': '已添加流动性', 'zh-TW': '已添加流動性' },
  'Add liquidity failed': { 'zh-CN': '添加流动性失败', 'zh-TW': '添加流動性失敗' },
  // REMOVE_LIQUIDITY_V3
  'Removing liquidity': { 'zh-CN': '移除流动性中', 'zh-TW': '移除流動性中' },
  'Removed liquidity': { 'zh-CN': '已移除流动性', 'zh-TW': '已移除流動性' },
  'Remove liquidity failed': { 'zh-CN': '移除流动性失败', 'zh-TW': '移除流動性失敗' },
  // CREATE_V3_POOL
  'Creating pool': { 'zh-CN': '创建池中', 'zh-TW': '創建池中' },
  'Created pool': { 'zh-CN': '已创建池', 'zh-TW': '已創建池' },
  'Create pool failed': { 'zh-CN': '创建池失败', 'zh-TW': '創建池失敗' },
  // COLLECT_FEES
  'Collecting fees': { 'zh-CN': '收取手续费中', 'zh-TW': '收取手續費中' },
  'Collected fees': { 'zh-CN': '已收取手续费', 'zh-TW': '已收取手續費' },
  'Collect fees failed': { 'zh-CN': '收取手续费失败', 'zh-TW': '收取手續費失敗' },
  // APPROVAL
  Approving: { 'zh-CN': '授权中', 'zh-TW': '授權中' },
  Approved: { 'zh-CN': '已授权', 'zh-TW': '已授權' },
  'Approval failed': { 'zh-CN': '授权失败', 'zh-TW': '授權失敗' },
  'Revoking approval': { 'zh-CN': '撤销授权中', 'zh-TW': '撤銷授權中' },
  'Revoked approval': { 'zh-CN': '已撤销授权', 'zh-TW': '已撤銷授權' },
  'Revoke approval failed': { 'zh-CN': '撤销授权失败', 'zh-TW': '撤銷授權失敗' },
  // CLAIM
  Claiming: { 'zh-CN': '领取中', 'zh-TW': '領取中' },
  Claimed: { 'zh-CN': '已领取', 'zh-TW': '已領取' },
  'Claim failed': { 'zh-CN': '领取失败', 'zh-TW': '領取失敗' },
  // BUY
  Buying: { 'zh-CN': '购买中', 'zh-TW': '購買中' },
  Bought: { 'zh-CN': '已购买', 'zh-TW': '已購買' },
  'Buy failed': { 'zh-CN': '购买失败', 'zh-TW': '購買失敗' },
  // SEND / RECEIVE
  Sending: { 'zh-CN': '发送中', 'zh-TW': '發送中' },
  Sent: { 'zh-CN': '已发送', 'zh-TW': '已發送' },
  'Send failed': { 'zh-CN': '发送失败', 'zh-TW': '發送失敗' },
  Receiving: { 'zh-CN': '接收中', 'zh-TW': '接收中' },
  Received: { 'zh-CN': '已接收', 'zh-TW': '已接收' },
  'Receive failed': { 'zh-CN': '接收失败', 'zh-TW': '接收失敗' },
  // MINT / BURN
  Minting: { 'zh-CN': '铸造中', 'zh-TW': '鑄造中' },
  Minted: { 'zh-CN': '已铸造', 'zh-TW': '已鑄造' },
  'Mint failed': { 'zh-CN': '铸造失败', 'zh-TW': '鑄造失敗' },
  Burning: { 'zh-CN': '销毁中', 'zh-TW': '銷毀中' },
  Burned: { 'zh-CN': '已销毁', 'zh-TW': '已銷毀' },
  'Burn failed': { 'zh-CN': '销毁失败', 'zh-TW': '銷毀失敗' },
  // BORROW / REPAY
  Borrowing: { 'zh-CN': '借款中', 'zh-TW': '借款中' },
  Borrowed: { 'zh-CN': '已借款', 'zh-TW': '已借款' },
  'Borrow failed': { 'zh-CN': '借款失败', 'zh-TW': '借款失敗' },
  Repaying: { 'zh-CN': '还款中', 'zh-TW': '還款中' },
  Repaid: { 'zh-CN': '已还款', 'zh-TW': '已還款' },
  'Repay failed': { 'zh-CN': '还款失败', 'zh-TW': '還款失敗' },
  // DEPLOY / CANCEL
  Deploying: { 'zh-CN': '部署中', 'zh-TW': '部署中' },
  Deployed: { 'zh-CN': '已部署', 'zh-TW': '已部署' },
  'Deploy failed': { 'zh-CN': '部署失败', 'zh-TW': '部署失敗' },
  Cancelling: { 'zh-CN': '取消中', 'zh-TW': '取消中' },
  Cancelled: { 'zh-CN': '已取消', 'zh-TW': '已取消' },
  'Cancel failed': { 'zh-CN': '取消失败', 'zh-TW': '取消失敗' },
  // DEPOSIT / WITHDRAW
  Depositing: { 'zh-CN': '存入中', 'zh-TW': '存入中' },
  Deposited: { 'zh-CN': '已存入', 'zh-TW': '已存入' },
  'Deposit failed': { 'zh-CN': '存入失败', 'zh-TW': '存入失敗' },
  Withdrawing: { 'zh-CN': '提取中', 'zh-TW': '提取中' },
  Withdrew: { 'zh-CN': '已提取', 'zh-TW': '已提取' },
  'Withdraw failed': { 'zh-CN': '提取失败', 'zh-TW': '提取失敗' },
  // V2 / MIGRATE
  'Adding V2 liquidity': { 'zh-CN': '添加 V2 流动性中', 'zh-TW': '添加 V2 流動性中' },
  'Added V2 liquidity': { 'zh-CN': '已添加 V2 流动性', 'zh-TW': '已添加 V2 流動性' },
  'Add V2 liquidity failed': { 'zh-CN': '添加 V2 流动性失败', 'zh-TW': '添加 V2 流動性失敗' },
  'Migrating liquidity': { 'zh-CN': '迁移流动性中', 'zh-TW': '遷移流動性中' },
  'Migrated liquidity': { 'zh-CN': '已迁移流动性', 'zh-TW': '已遷移流動性' },
  'Migrate liquidity failed': { 'zh-CN': '迁移流动性失败', 'zh-TW': '遷移流動性失敗' },
  // Cancelled titles
  'Swap cancelled': { 'zh-CN': '交换已取消', 'zh-TW': '交換已取消' },
  'Wrap cancelled': { 'zh-CN': '包装已取消', 'zh-TW': '包裝已取消' },
  'Add liquidity cancelled': { 'zh-CN': '添加流动性已取消', 'zh-TW': '添加流動性已取消' },
  'Remove liquidity cancelled': { 'zh-CN': '移除流动性已取消', 'zh-TW': '移除流動性已取消' },
  'Create pool cancelled': { 'zh-CN': '创建池已取消', 'zh-TW': '創建池已取消' },
  'Collect fees cancelled': { 'zh-CN': '收取手续费已取消', 'zh-TW': '收取手續費已取消' },
  'Approval cancelled': { 'zh-CN': '授权已取消', 'zh-TW': '授權已取消' },
  'Claim cancelled': { 'zh-CN': '领取已取消', 'zh-TW': '領取已取消' },
  'Buy cancelled': { 'zh-CN': '购买已取消', 'zh-TW': '購買已取消' },
  'Send cancelled': { 'zh-CN': '发送已取消', 'zh-TW': '發送已取消' },
  'Receive cancelled': { 'zh-CN': '接收已取消', 'zh-TW': '接收已取消' },
  'Mint cancelled': { 'zh-CN': '铸造已取消', 'zh-TW': '鑄造已取消' },
  'Burn cancelled': { 'zh-CN': '销毁已取消', 'zh-TW': '銷毀已取消' },
  'Borrow cancelled': { 'zh-CN': '借款已取消', 'zh-TW': '借款已取消' },
  'Repay cancelled': { 'zh-CN': '还款已取消', 'zh-TW': '還款已取消' },
  'Deploy cancelled': { 'zh-CN': '部署已取消', 'zh-TW': '部署已取消' },
  'Cancellation cancelled': { 'zh-CN': '取消操作已取消', 'zh-TW': '取消操作已取消' },
  'Deposit cancelled': { 'zh-CN': '存入已取消', 'zh-TW': '存入已取消' },
  'Withdrawal cancelled': { 'zh-CN': '提取已取消', 'zh-TW': '提取已取消' },
  'Add V2 liquidity cancelled': { 'zh-CN': '添加 V2 流动性已取消', 'zh-TW': '添加 V2 流動性已取消' },
  'Migrate liquidity cancelled': { 'zh-CN': '迁移流动性已取消', 'zh-TW': '遷移流動性已取消' },
}

// eslint-disable-next-line import/no-unused-modules -- 类型供外部标注 locale 时使用
export type SupportedActivityLocale = 'zh-CN' | 'zh-TW'

export function getTranslatedActivityTitle(title: string, locale: string): string {
  const zh = ACTIVITY_TITLE_ZH[title]
  if (!zh) return title
  if (locale === 'zh-CN') return zh['zh-CN']
  if (locale === 'zh-TW') return zh['zh-TW']
  return title
}
