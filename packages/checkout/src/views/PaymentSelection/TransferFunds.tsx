import { Box,Button, Card, Text, useMediaQuery } from '@0xsequence/design-system'
import { useAccount } from 'wagmi'

import { getCardHeight } from '../../utils/sizing'
import { useTransferFundsModal } from '../../hooks'

interface TransferFundsProps {
  disableButtons: boolean
}

export const TransferFunds = ({
  disableButtons
}: TransferFundsProps) => {
  const isMobile = useMediaQuery('isMobile')
  const { openTransferFundsModal } = useTransferFundsModal()
  const { address: userAddress } = useAccount()

  const onClickTransfer = () => {
    if (!userAddress) {
      return
    }
    openTransferFundsModal({
      walletAddress: userAddress
    })
  }

  return (
    <Card
      width="full"
      flexDirection={isMobile ? 'column' : 'row'}
      alignItems="center"
      justifyContent="space-between"
      gap={isMobile ? '2' : '0'}
      style={{
        minHeight: getCardHeight(isMobile)
      }}
    >
      <Box justifyContent={isMobile ? 'center' : 'flex-start'}>
        <Text color="text100">Transfer Funds to Wallet</Text>
      </Box>
      <Box
        flexDirection="column"
        gap="2"
        alignItems={isMobile ? 'center' : 'flex-start'}
        style={{ ...(isMobile ? { width: '200px' } : {}) }}
      >
        <Button
          disabled={disableButtons}
          label="Transfer"
          onClick={onClickTransfer}
          variant="primary"
          shape="square"
        />
      </Box>
    </Card>
  )
}