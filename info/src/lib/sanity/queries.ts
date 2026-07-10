import { getSanityAuthToken } from 'utils/env'

import { sanityClient } from './client'

export async function fetchTokenDescription(tokenAddress: string) {
  if (!getSanityAuthToken()) {
    return null
  }

  try {
    const query = `*[_type == "token" && lower(tokenContract) == $tokenAddress][0]{ description }`
    const params = { tokenAddress: tokenAddress.toLowerCase() }
    return await sanityClient.fetch(query, params)
  } catch (error) {
    console.debug('Failed to fetch token description from Sanity:', error)
    return null
  }
}
