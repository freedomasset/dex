import { useMemo } from 'react'
import { useQuery } from '@apollo/client'
import gql from 'graphql-tag'
import { useActiveNetworkVersion, useClients } from 'state/application/hooks'
import { notEmpty } from 'utils'
import { POOL_ALLOW_LIST } from '../../constants'

export const TOP_POOLS = gql`
  query topPools {
    pools(first: 50, orderBy: totalValueLockedUSD, orderDirection: desc, subgraphError: allow) {
      id
    }
  }
`

interface TopPoolsResponse {
  pools: {
    id: string
  }[]
}

/**
 * Fetch top addresses by volume
 */
export function useTopPoolAddresses(): {
  loading: boolean
  error: boolean
  addresses: string[] | undefined
} {
  const [currentNetwork] = useActiveNetworkVersion()
  const { dataClient } = useClients()
  const { loading, error, data } = useQuery<TopPoolsResponse>(TOP_POOLS, {
    client: dataClient,
    fetchPolicy: 'cache-first',
  })

  const formattedData = useMemo(() => {
    if (data) {
      const allowList = POOL_ALLOW_LIST[currentNetwork.id] || []
      return data.pools
        .map((p) => {
          // 如果 ALLOW_LIST 为空，则不过滤；否则只返回在列表中的池子
          if (allowList.length > 0 && !allowList.includes(p.id.toLowerCase())) {
            return undefined
          }
          return p.id
        })
        .filter(notEmpty)
    } else {
      return undefined
    }
  }, [currentNetwork.id, data])

  return {
    loading: loading,
    error: Boolean(error),
    addresses: formattedData,
  }
}
