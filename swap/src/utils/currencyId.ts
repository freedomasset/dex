import { Currency } from '@vanadex/sdk-core'

/** 返回用于 URL/状态的 currency 标识：原生币用 symbol（TT、VANA、ETH），代币用 address */
export function currencyId(currency: Currency): string {
  if (currency.isNative) return currency.symbol ?? 'ETH'
  if (currency.isToken) return currency.address
  throw new Error('invalid currency')
}
