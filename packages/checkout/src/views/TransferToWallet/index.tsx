import { Box, Text } from '@0xsequence/design-system'
import { useAccount } from 'wagmi'

import { HEADER_HEIGHT } from '../../constants'
import { QRCode } from './QRCode'
import { useTransferFundsModal } from '../../hooks'

export const TransferToWallet = () => {
  const { address: userAddress } = useAccount()
  const { transferFundsSettings } = useTransferFundsModal()

  const address = transferFundsSettings?.walletAddress || userAddress || ''

  return (
    <Box
      flexDirection="column"
      gap='2'
      alignItems="center"
      justifyContent="center"
      width="full"
      paddingX="4"
      paddingBottom="4"
      height="full"
      style={{ paddingTop: HEADER_HEIGHT }}
    >
      <Box flexDirection="column" alignItems="center" paddingX="4" paddingBottom="4" minHeight="full">
        <Box flexDirection="column" placeItems="center" width="full">
          <Text as="p" variant="normal" color="text50" textAlign="center">
            Share your wallet address to receive coins
          </Text>
            <Box marginY="4">
              <QRCode value={address} data-id="receiveQR" />
            </Box>

            <Text as="div" width="full" variant="normal" color="text50" textAlign="center" data-id="receiveAddress">
              {address}
            </Text>
        </Box>
      </Box>
    </Box>
  )
}