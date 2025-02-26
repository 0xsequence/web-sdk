import { Hex } from 'viem'

import { createGenericContext } from './genericContext'

export interface TransferFundsSettings {
  walletAddress: string | Hex
  onClose?: () => void
}

type TransferFundsModalContext = {
  openTransferFundsModal: (settings: TransferFundsSettings) => void
  closeTransferFundsModal: () => void
  transferFundsSettings?: TransferFundsSettings
}

export const [useTransferFundsModalContext, TransferFundsContextProvider] = createGenericContext<TransferFundsModalContext>()
