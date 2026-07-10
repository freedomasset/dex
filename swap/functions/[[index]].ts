/* eslint-disable import/no-unused-modules */
import { MetaTagInjector } from './components/metaTagInjector'

export const onRequest: PagesFunction = async ({ request, next }) => {
  const imageUri = new URL(request.url).origin + '/images/1200x630_Rich_Link_Preview_Image.png'
  const data = {
    title: 'Freedom Asset',
    image: imageUri,
    url: request.url,
    description: 'Swap or provide liquidity on the Freedom Asset Protocol',
  }
  const res = next()
  try {
    return new HTMLRewriter().on('head', new MetaTagInjector(data, request)).transform(await res)
  } catch (e) {
    return res
  }
}
