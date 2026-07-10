import { BigNumber } from '@ethersproject/bignumber'
// gets the current timestamp from the blockchain
export default function useCurrentBlockTimestamp(): BigNumber {
  return BigNumber.from(BigInt(Math.floor(Date.now() / 1000)))
}
