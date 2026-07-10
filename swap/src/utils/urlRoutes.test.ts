import { getCurrentPageFromLocation } from './urlRoutes'

describe('getCurrentPageFromLocation', () => {
  it('should return SWAP_PAGE when location pathname starts with "/swap"', () => {
    const result = getCurrentPageFromLocation('/swap/123')
    expect(result).toBe('SWAP_PAGE')
  })

  it('should return POOL_PAGE when location pathname starts with "/pools" or "/pool"', () => {
    let result = getCurrentPageFromLocation('/pools/789')
    expect(result).toBe('POOL_PAGE')

    result = getCurrentPageFromLocation('/pool/abc')
    expect(result).toBe('POOL_PAGE')
  })

  it('should return TOKENS_PAGE when location pathname starts with "/tokens"', () => {
    const result = getCurrentPageFromLocation('/tokens/xyz')
    expect(result).toBe('TOKENS_PAGE')
  })

  it('should return undefined for unknown location pathnames', () => {
    const result = getCurrentPageFromLocation('/unknown')
    expect(result).toBeUndefined()
  })
})
