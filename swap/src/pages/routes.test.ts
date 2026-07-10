import { routes } from './RouteDefinitions'

describe('Routes', () => {
  it('router definition should match snapshot', () => {
    expect(routes).toMatchSnapshot()
  })
})
