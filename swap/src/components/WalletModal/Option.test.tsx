import { Connector } from '@web3-react/types'
import { useToggleAccountDrawer } from 'components/AccountDrawer'
import { Connection, ConnectionType } from 'connection/types'
import { mocked } from 'test-utils/mocked'
import { createDeferredPromise } from 'test-utils/promise'
import { act, render } from 'test-utils/render'

import Option from './Option'

const mockToggleDrawer = jest.fn()
jest.mock('components/AccountDrawer')

beforeEach(() => {
  jest.spyOn(console, 'debug').mockReturnValue()
  mocked(useToggleAccountDrawer).mockReturnValue(mockToggleDrawer)
})

const mockConnection2: Connection = {
  getName: () => 'Mock Connection 2',
  connector: {
    activate: jest.fn(),
    deactivate: jest.fn(),
  } as unknown as Connector,
  type: ConnectionType.INJECTED,
} as unknown as Connection

describe('Wallet Option', () => {
  it('connect when clicked', async () => {
    const activationResponse = createDeferredPromise()
    mocked(mockConnection2.connector.activate).mockReturnValue(activationResponse.promise)

    const component = render(
      <>
        <Option connection={mockConnection2} />
      </>
    )
    const option2 = component.getByTestId('wallet-option-INJECTED')

    expect(option2).toBeEnabled()
    expect(option2).toHaveProperty('selected', false)

    expect(mockConnection2.connector.activate).toHaveBeenCalledTimes(0)
    act(() => option2.click())
    expect(mockConnection2.connector.activate).toHaveBeenCalledTimes(1)

    expect(option2).toBeDisabled()
    expect(option2).toHaveProperty('selected', true)

    await act(async () => activationResponse.resolve())

    expect(option2).toBeEnabled()
    expect(option2).toHaveProperty('selected', false)
  })
})
