import useInterfaceChainId from 'hooks/useInterfaceChainId'
import useParsedQueryString from 'hooks/useParsedQueryString'
import { useEffect, useRef } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { buildCleanSwapSearch, shouldResetRouteOnChainChange } from 'utils/chainNavigation'

/**
 * 切链时若当前页带有链上 tokenId / 代币地址等参数，跳转到 /swap 并清理代币 query。
 */
export default function useRedirectOnChainChange() {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const interfaceChainId = useInterfaceChainId()
  const parsedQs = useParsedQueryString()
  const prevChainIdRef = useRef<number | null>(null)

  useEffect(() => {
    if (interfaceChainId === undefined) return

    const chainChanged = prevChainIdRef.current !== null && prevChainIdRef.current !== interfaceChainId

    if (chainChanged && shouldResetRouteOnChainChange(pathname, parsedQs)) {
      navigate(
        {
          pathname: '/swap',
          search: buildCleanSwapSearch(interfaceChainId, parsedQs),
        },
        { replace: true }
      )
    }

    prevChainIdRef.current = interfaceChainId
  }, [interfaceChainId, pathname, parsedQs, navigate])
}
