// Load environment variables from .env file
import dotenv from 'dotenv'
dotenv.config()

import { createClient } from '@sanity/client'

const projectId = process.env.SANITY_PROJECT_ID ?? process.env.REACT_APP_SANITY_PROJECT_ID ?? ''
const dataset = process.env.SANITY_DATASET ?? process.env.REACT_APP_SANITY_DATASET ?? 'mainnet'
const token = process.env.SANITY_AUTH_TOKEN ?? process.env.REACT_APP_SANITY_AUTH_TOKEN

export const sanityClient = createClient({
  projectId,
  dataset,
  useCdn: false,
  apiVersion: '2023-06-01',
  token,
})
