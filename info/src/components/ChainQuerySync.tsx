import { useEffect, useRef } from 'react'
import { parse } from 'qs'
import { useDispatch } from 'react-redux'
import { useLocation, useNavigate } from 'react-router-dom'
import { updateActiveNetworkVersion } from 'state/application/actions'
import { AppDispatch } from 'state'
import store from 'state'
import { useActiveNetworkVersion } from 'state/application/hooks'
import {
  getSwapChainParamFromChainId,
  resolveInfoNetworkFromChainQuery,
} from 'utils/getNetworkByEnv'

/** /tokens/:address 或 /pools/:address（链上地址与链绑定，切链后应回首页） */
function isChainSpecificDetailPath(pathname: string): boolean {
  return /^\/(?:tokens|pools)\/[^/]+/.test(pathname)
}

function homePathWithChain(chainId: number): { pathname: string; search: string } {
  const params = new URLSearchParams()
  params.set('chain', getSwapChainParamFromChainId(chainId))
  return { pathname: '/', search: `?${params.toString()}` }
}

/**
 * 与 Swap 一致使用 `?chain=`（Hash 路由下形如 `/#/?chain=sepolia`）。
 *
 * 必须区分两类更新，否则会「下拉选了链立刻被 URL 盖回去」，并触发 Apollo 请求连续 abort（表现为 canceled）：
 * - 地址栏 / query 变化：以 URL 为准，写入 Redux
 * - 仅 Redux（下拉）变化：以 Redux 为准，回写 URL
 */
export default function ChainQuerySync(): null {
  const dispatch = useDispatch<AppDispatch>()
  const { pathname, search } = useLocation()
  const navigate = useNavigate()
  const [activeNetwork] = useActiveNetworkVersion()
  const prevSearchRef = useRef<string | null>(null)
  const prevChainIdRef = useRef<number | null>(null)

  useEffect(() => {
    const searchChanged = prevSearchRef.current !== search
    prevSearchRef.current = search

    const params = new URLSearchParams(search.startsWith('?') ? search.slice(1) : search)
    const parsed =
      search && search.length > 1
        ? parse(search, { parseArrays: false, ignoreQueryPrefix: true })
        : {}
    const chainParam = typeof parsed.chain === 'string' ? parsed.chain : undefined
    const fromUrl = chainParam ? resolveInfoNetworkFromChainQuery(chainParam) : null
    const desired = getSwapChainParamFromChainId(activeNetwork.chainId)
    const chainIdChanged =
      prevChainIdRef.current !== null && prevChainIdRef.current !== activeNetwork.chainId

    if (searchChanged) {
      if (fromUrl) {
        const cur = store.getState().application.activeNetworkVersion.chainId
        if (cur !== fromUrl.chainId) {
          dispatch(updateActiveNetworkVersion({ activeNetworkVersion: fromUrl }))
          if (isChainSpecificDetailPath(pathname)) {
            navigate(homePathWithChain(fromUrl.chainId), { replace: true })
          }
        }
        prevChainIdRef.current = fromUrl.chainId
        return
      }
    }

    if (chainIdChanged && isChainSpecificDetailPath(pathname)) {
      prevChainIdRef.current = activeNetwork.chainId
      navigate(homePathWithChain(activeNetwork.chainId), { replace: true })
      return
    }

    prevChainIdRef.current = activeNetwork.chainId

    if (params.get('chain') === desired) return
    params.set('chain', desired)
    const next = params.toString()
    navigate({ pathname, search: next ? `?${next}` : '' }, { replace: true })
  }, [pathname, search, activeNetwork.chainId, dispatch, navigate])

  return null
}
