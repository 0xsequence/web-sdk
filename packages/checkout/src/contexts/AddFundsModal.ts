import { Theme } from '@0xsequence/kit'

import { createGenericContext } from './genericContext'

export interface AddFundsSettings {
  walletAddress: string,
  fiatCurrency: string,
  defaultFiatAmount?: string,
  defaultCryptoCurrency?: string,
  networks?: string
}

type AddFundsModalContext = {
  triggerAddFunds: (settings: AddFundsSettings) => void
  closeAddFunds: () => void
  addFundsSettings?: AddFundsSettings
}

export const [useAddFundsModalContext, AddFundsContextProvider] = createGenericContext<AddFundsModalContext>()
