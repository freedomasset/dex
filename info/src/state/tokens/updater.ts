import { useAllTokenData, useUpdateTokenData, useAddTokenKeys } from './hooks'
import { useEffect, useMemo } from 'react'
import { useTopTokenAddresses } from '../../data/tokens/topTokens'
import { useFetchedTokenDatas } from 'data/tokens/tokenData'

export default function Updater(): null {
  // updaters
  const updateTokenDatas = useUpdateTokenData()
  const addTokenKeys = useAddTokenKeys()

  // intitial data
  const allTokenData = useAllTokenData()
  const { loading, error, addresses } = useTopTokenAddresses()

  console.log('[TokenUpdater] useTopTokenAddresses result:', { loading, error, addressesCount: addresses?.length, addresses })

  // add top pools on first load
  useEffect(() => {
    console.log('[TokenUpdater] useEffect for addTokenKeys:', { addresses, error, loading, condition: addresses && !error && !loading })
    if (addresses && !error && !loading) {
      console.log('[TokenUpdater] Calling addTokenKeys with:', addresses)
      addTokenKeys(addresses)
    }
  }, [addTokenKeys, addresses, error, loading])

  // detect for which addresses we havent loaded token data yet
  const unfetchedTokenAddresses = useMemo(() => {
    const allKeys = Object.keys(allTokenData)
    const unfetched = allKeys.reduce((accum: string[], key) => {
      const tokenData = allTokenData[key]
      if (!tokenData || !tokenData.data || !tokenData.lastUpdated) {
        accum.push(key)
      }
      return accum
    }, [])
    console.log('[TokenUpdater] Unfetched token addresses:', { 
      allKeysCount: allKeys.length, 
      unfetchedCount: unfetched.length, 
      unfetched 
    })
    return unfetched
  }, [allTokenData])

  // update unloaded pool entries with fetched data
  const {
    error: tokenDataError,
    loading: tokenDataLoading,
    data: tokenDatas,
  } = useFetchedTokenDatas(unfetchedTokenAddresses)

  console.log('[TokenUpdater] useFetchedTokenDatas result:', { 
    tokenDataError, 
    tokenDataLoading, 
    hasTokenDatas: !!tokenDatas,
    tokenDatasCount: tokenDatas ? Object.keys(tokenDatas).length : 0,
    unfetchedCount: unfetchedTokenAddresses.length
  })

  useEffect(() => {
    console.log('[TokenUpdater] useEffect for updateTokenDatas:', { 
      tokenDatas: !!tokenDatas, 
      tokenDataError, 
      tokenDataLoading,
      condition: tokenDatas && !tokenDataError && !tokenDataLoading
    })
    if (tokenDatas && !tokenDataError && !tokenDataLoading) {
      const values = Object.values(tokenDatas)
      console.log('[TokenUpdater] Calling updateTokenDatas with:', values.length, 'tokens')
      updateTokenDatas(values)
    }
  }, [tokenDataError, tokenDataLoading, tokenDatas, updateTokenDatas])

  return null
}
