import React from 'react'
import TokenPage from './TokenPage'
import { isAddress } from 'ethers'
import { Navigate, useParams, useLocation } from 'react-router-dom'

export function RedirectInvalidToken() {
  const { address } = useParams<{ address?: string }>()
  const { search } = useLocation()

  if (!address || !isAddress(address)) {
    return <Navigate to={{ pathname: '/', search }} replace />
  }
  return <TokenPage />
}
