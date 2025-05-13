import { TransactionOnRampProvider } from '@0xsequence/marketplace'
import type { Hex } from 'viem'

import { createGenericContext } from './genericContext.js'

export interface AddFundsSettings {
  walletAddress: string | Hex
  fiatAmount?: string
  fiatCurrency?: string
  defaultFiatAmount?: string
  defaultCryptoCurrency?: string
  cryptoCurrencyList?: string
  networks?: string
  onClose?: () => void
  onOrderCreated?: (data: any) => void
  onOrderSuccessful?: (data: any) => void
  onOrderFailed?: (data: any) => void
  provider?: TransactionOnRampProvider
  cryptoAmount?: string
}

type AddFundsModalContext = {
  isAddFundsModalOpen: boolean
  triggerAddFunds: (settings: AddFundsSettings) => void
  closeAddFunds: () => void
  addFundsSettings?: AddFundsSettings
}

const [useAddFundsModalContext, AddFundsContextProvider] = createGenericContext<AddFundsModalContext>()

export { AddFundsContextProvider, useAddFundsModalContext }
