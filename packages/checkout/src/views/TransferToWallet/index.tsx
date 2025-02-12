import { Text } from '@0xsequence/design-system'
import { useAccount } from 'wagmi'

import { HEADER_HEIGHT } from '../../constants'
import { useTransferFundsModal } from '../../hooks'

import { QRCode } from './QRCode'

export const TransferToWallet = () => {
  const { address: userAddress } = useAccount()
  const { transferFundsSettings } = useTransferFundsModal()

  const address = transferFundsSettings?.walletAddress || userAddress || ''

  return (
    <div
      className="flex flex-col gap-2 items-center justify-center w-full px-4 pb-4 h-full"
      style={{ paddingTop: HEADER_HEIGHT }}
    >
      <div className="flex flex-col items-center px-4 pb-4 min-h-full">
        <div className="flex flex-col items-center justify-center w-full">
          <Text className="text-center" variant="normal" color="muted" asChild>
            <p>Share your wallet address to receive coins</p>
          </Text>
          <div className="my-4">
            <QRCode value={address} data-id="receiveQR" />
          </div>

          <Text className="w-full text-center" variant="normal" color="muted" asChild>
            <div data-id="receiveAddress">{address}</div>
          </Text>
        </div>
      </div>
    </div>
  )
}
