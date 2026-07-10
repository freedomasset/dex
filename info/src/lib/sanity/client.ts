import { createClient } from '@sanity/client'

import { getSanityAuthToken, getSanityDataset, getSanityProjectId } from 'utils/env'

const projectId = getSanityProjectId()
const hasAuthToken = !!getSanityAuthToken()

export const sanityClient = createClient({
  projectId,
  dataset: getSanityDataset(),
  apiVersion: '2023-06-01',
  useCdn: false,
  token: hasAuthToken ? getSanityAuthToken() : undefined,
})
