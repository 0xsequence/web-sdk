import { Box, Text } from '@0xsequence/design-system'
import { useAccount } from 'wagmi'

import { HEADER_HEIGHT } from '../../constants'
import { useTransferFundsModal } from '../../hooks'

export const TransactionStatus = () => {
  const { address: userAddress } = useAccount()
  const { transferFundsSettings } = useTransferFundsModal()

  return (
    <Box
      flexDirection="column"
      gap="2"
      alignItems="center"
      justifyContent="center"
      width="full"
      paddingX="4"
      paddingBottom="4"
      height="full"
      style={{ paddingTop: HEADER_HEIGHT }}
    >
      <Text color="text100">transaction status is here...</Text>
    </Box>
  )
}
