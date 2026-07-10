import { JsonRpcProvider, JsonRpcSigner } from '@ethersproject/providers'
import { signTypedData } from 'utils/signing'

describe('signing', () => {
  describe('signTypedData', () => {
    const wallet = '0xcd2a3d9f938e13cd947ec05abc7fe734df8dd826'
    const domain = {
      name: 'Ether Mail',
      version: '1',
      chainId: '1',
      verifyingContract: '0xcccccccccccccccccccccccccccccccccccccccc',
    }

    const types = {
      Person: [
        { name: 'name', type: 'string' },
        { name: 'wallet', type: 'address' },
      ],
      Mail: [
        { name: 'from', type: 'Person' },
        { name: 'to', type: 'Person' },
        { name: 'contents', type: 'string' },
      ],
    }

    const value = {
      from: {
        name: 'Cow',
        wallet,
      },
      to: {
        name: 'Bob',
        wallet: '0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
      },
      contents: 'Hello, Bob!',
    }

    let signer: JsonRpcSigner
    beforeEach(() => {
      signer = new JsonRpcProvider().getSigner()
      jest.spyOn(signer, 'getAddress').mockResolvedValue(wallet)
    })

    it('signs using eth_signTypedData_v4', async () => {
      const send = jest.spyOn(signer.provider, 'send').mockImplementationOnce((method) => {
        if (method === 'eth_signTypedData_v4') return Promise.resolve()
        throw new Error('Unimplemented')
      })

      await signTypedData(signer, domain, types, value)
      expect(send).toHaveBeenCalledTimes(1)
      expect(send).toHaveBeenCalledWith('eth_signTypedData_v4', [wallet, expect.anything()])
      const data = send.mock.lastCall[1]?.[1]
      expect(JSON.parse(data)).toEqual(expect.objectContaining({ domain, message: value }))
    })
  })
})
