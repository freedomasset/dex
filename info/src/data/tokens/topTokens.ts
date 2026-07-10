import { useMemo } from 'react'
import { useQuery } from '@apollo/client'
import gql from 'graphql-tag'
import { useClients } from 'state/application/hooks'

export const TOP_TOKENS = gql`
  query topPools {
    tokens(first: 50, orderBy: totalValueLockedUSD, orderDirection: desc, subgraphError: allow) {
      id
    }
  }
`

interface TopTokensResponse {
  tokens: {
    id: string
  }[]
}

/**
 * Fetch top addresses by volume
 */
export function useTopTokenAddresses(): {
  loading: boolean
  error: boolean
  addresses: string[] | undefined
} {
  const { dataClient } = useClients()

  const { loading, error, data } = useQuery<TopTokensResponse>(TOP_TOKENS, {
    client: dataClient,
    fetchPolicy: 'network-only', // 网络切换时强制重新获取数据
    notifyOnNetworkStatusChange: true,
    skip: !dataClient,
  })

  console.log('[useTopTokenAddresses] Query state:', { loading, error, hasData: !!data, tokensCount: data?.tokens?.length })

  const formattedData = useMemo(() => {
    if (data) {
      const addresses = data.tokens.map((t) => t.id)
      console.log('[useTopTokenAddresses] Formatted addresses:', addresses)
      return addresses
    } else {
      console.log('[useTopTokenAddresses] No data, returning undefined')
      return undefined
    }
  }, [data])

  console.log('[useTopTokenAddresses] Returning:', { loading, error: Boolean(error), addressesCount: formattedData?.length })

  return {
    loading: loading,
    error: Boolean(error),
    addresses: formattedData,
  }
}
