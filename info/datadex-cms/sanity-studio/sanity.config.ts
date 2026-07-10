import { defineConfig } from 'sanity'
import { deskTool } from 'sanity/desk'

import { schemaTypes } from './schemas'

const projectId = process.env.SANITY_STUDIO_PROJECT_ID ?? process.env.SANITY_PROJECT_ID ?? ''
const dataset = process.env.SANITY_STUDIO_DATASET ?? process.env.SANITY_DATASET ?? 'mainnet'

export default defineConfig({
  name: 'default',
  title: 'Freedom Asset CMS',
  projectId,
  dataset,
  apiVersion: '2023-06-01',
  useCdn: false,
  plugins: [deskTool()],
  schema: {
    types: schemaTypes,
  },
})
