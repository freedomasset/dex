export function getCurrentPageFromLocation(locationPathname: string) {
  switch (true) {
    case locationPathname.startsWith('/swap'):
      return 'SWAP_PAGE'
    case locationPathname.startsWith('/pools'):
    case locationPathname.startsWith('/pool'):
      return 'POOL_PAGE'
    case locationPathname.startsWith('/tokens'):
      return 'TOKENS_PAGE'
    default:
      return undefined
  }
}
