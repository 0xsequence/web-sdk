import type { Hex } from 'viem'

import { createGenericContext } from './genericContext.js'

export interface TransferFundsSettings {
  walletAddress: string | Hex
  onClose?: () => void
}

type TransferFundsModalContext = {
  openTransferFundsModal: (settings: TransferFundsSettings) => void
  closeTransferFundsModal: () => void
  transferFundsSettings?: TransferFundsSettings
}

const [useTransferFundsModalContext, TransferFundsContextProvider] = createGenericContext<TransferFundsModalContext>()

export { TransferFundsContextProvider, useTransferFundsModalContext }
