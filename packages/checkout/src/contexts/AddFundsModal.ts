import { Hex } from 'viem'

import { createGenericContext } from './genericContext'

export interface AddFundsSettings {
  walletAddress: string | Hex
  fiatCurrency?: string
  defaultFiatAmount?: string
  defaultCryptoCurrency?: string
  networks?: string
  onClose?: () => void
}

type AddFundsModalContext = {
  triggerAddFunds: (settings: AddFundsSettings) => void
  closeAddFunds: () => void
  addFundsSettings?: AddFundsSettings
}

export const [useAddFundsModalContext, AddFundsContextProvider] = createGenericContext<AddFundsModalContext>()
