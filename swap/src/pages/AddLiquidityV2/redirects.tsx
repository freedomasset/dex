import { Navigate, useLocation, useParams } from 'react-router-dom'

import AddLiquidityV2 from './index'

export default function RedirectDuplicateTokenIdsV2() {
  const { currencyIdA, currencyIdB } = useParams<{ currencyIdA: string; currencyIdB: string }>()
  const location = useLocation()

  if (currencyIdA && currencyIdB && currencyIdA.toLowerCase() === currencyIdB.toLowerCase()) {
    return <Navigate to={{ pathname: `/add/v2/${currencyIdA}`, search: location.search }} replace />
  }

  return <AddLiquidityV2 />
}
