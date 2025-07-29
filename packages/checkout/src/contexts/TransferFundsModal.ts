import { createGenericContext } from '@0xsequence/common'
import type { Hex } from 'viem'

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
