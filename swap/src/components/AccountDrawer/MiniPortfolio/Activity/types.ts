import { ChainId, Currency } from '@vanadex/sdk-core'
import { TransactionStatus } from 'types/types-and-hooks'

export type Activity = {
  hash: string
  chainId: ChainId
  status: TransactionStatus
  statusMessage?: string
  timestamp: number
  title: string
  descriptor?: string
  logos?: Array<string | undefined>
  currencies?: Array<Currency | undefined>
  otherAccount?: string
  from: string
  nonce?: number | null
  prefixIconSrc?: string
  cancelled?: boolean
}

export type ActivityMap = { [id: string]: Activity | undefined }
