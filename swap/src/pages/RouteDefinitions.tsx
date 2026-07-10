import { lazy, ReactNode, useMemo } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { toWithPreservedRouterSearch } from 'utils/withPreservedRouterSearch'

// High-traffic pages (index and /swap) should not be lazy-loaded.
import Swap from './Swap'

const AddLiquidity = lazy(() => import('pages/AddLiquidity'))
const RedirectDuplicateTokenIds = lazy(() => import('pages/AddLiquidity/redirects'))
const RedirectDuplicateTokenIdsV2 = lazy(() => import('pages/AddLiquidityV2/redirects'))
const MigrateV2 = lazy(() => import('pages/MigrateV2'))
const MigrateV2Pair = lazy(() => import('pages/MigrateV2/MigrateV2Pair'))
const NotFound = lazy(() => import('pages/NotFound'))
const Pool = lazy(() => import('pages/Pool'))
const WhatIsHorswap = lazy(() => import('pages/WhatIsHorswap'))
const PositionPage = lazy(() => import('pages/Pool/PositionPage'))
const PoolV2 = lazy(() => import('pages/Pool/v2'))
const PoolFinder = lazy(() => import('pages/PoolFinder'))
const PrivacyPolicy = lazy(() => import('pages/PrivacyPolicy'))
const RemoveLiquidity = lazy(() => import('pages/RemoveLiquidity'))
const RemoveLiquidityV3 = lazy(() => import('pages/RemoveLiquidity/V3'))
const TermsOfUse = lazy(() => import('pages/TermsOfUse'))
interface RouterConfig {
  hash?: string
}

/**
 * Convenience hook which organizes the router configuration into a single object.
 */
export function useRouterConfig(): RouterConfig {
  const { hash } = useLocation()
  return useMemo(
    () => ({
      hash,
    }),
    [hash]
  )
}

export interface RouteDefinition {
  path: string
  nestedPaths: string[]
  enabled: (args: RouterConfig) => boolean
  getElement: (args: RouterConfig) => ReactNode
}

// Assigns the defaults to the route definition.
function WildcardNavigateToNotFound() {
  const { search } = useLocation()
  return <Navigate to={toWithPreservedRouterSearch('/not-found', search)} replace />
}

function createRouteDefinition(route: Partial<RouteDefinition>): RouteDefinition {
  return {
    getElement: () => null,
    enabled: () => true,
    path: '/',
    nestedPaths: [],
    // overwrite the defaults
    ...route,
  }
}

export const routes: RouteDefinition[] = [
  createRouteDefinition({
    path: '/',
    getElement: () => <Swap />,
  }),
  createRouteDefinition({ path: '/swap', getElement: () => <Swap /> }),
  createRouteDefinition({ path: '/pool/v2/find', getElement: () => <PoolFinder /> }),
  createRouteDefinition({ path: '/pool/v2', getElement: () => <PoolV2 /> }),
  createRouteDefinition({ path: '/pool', getElement: () => <Pool /> }),
  createRouteDefinition({ path: '/pool/:tokenId', getElement: () => <PositionPage /> }),
  createRouteDefinition({ path: '/pools/v2/find', getElement: () => <PoolFinder /> }),
  createRouteDefinition({ path: '/pools/v2', getElement: () => <PoolV2 /> }),
  createRouteDefinition({ path: '/pools', getElement: () => <Pool /> }),
  createRouteDefinition({ path: '/pools/:tokenId', getElement: () => <PositionPage /> }),
  createRouteDefinition({ path: '/privacy-policy', getElement: () => <PrivacyPolicy /> }),
  createRouteDefinition({ path: '/terms-of-use', getElement: () => <TermsOfUse /> }),
  createRouteDefinition({ path: '/whatishorswap', getElement: () => <WhatIsHorswap /> }),
  createRouteDefinition({
    path: '/add/v2',
    nestedPaths: [':currencyIdA', ':currencyIdA/:currencyIdB'],
    getElement: () => <RedirectDuplicateTokenIdsV2 />,
  }),
  createRouteDefinition({
    path: '/add/:currencyIdA?/:currencyIdB?/:feeAmount?',
    nestedPaths: [],
    getElement: () => <RedirectDuplicateTokenIds />,
  }),

  createRouteDefinition({
    path: '/increase',
    nestedPaths: [
      ':currencyIdA',
      ':currencyIdA/:currencyIdB',
      ':currencyIdA/:currencyIdB/:feeAmount',
      ':currencyIdA/:currencyIdB/:feeAmount/:tokenId',
    ],
    getElement: () => <AddLiquidity />,
  }),
  createRouteDefinition({ path: '/remove/v2/:currencyIdA/:currencyIdB', getElement: () => <RemoveLiquidity /> }),
  createRouteDefinition({ path: '/remove/:tokenId', getElement: () => <RemoveLiquidityV3 /> }),
  createRouteDefinition({ path: '/migrate/v2', getElement: () => <MigrateV2 /> }),
  createRouteDefinition({ path: '/migrate/v2/:address', getElement: () => <MigrateV2Pair /> }),
  createRouteDefinition({ path: '*', getElement: () => <WildcardNavigateToNotFound /> }),
  createRouteDefinition({ path: '/not-found', getElement: () => <NotFound /> }),
]
