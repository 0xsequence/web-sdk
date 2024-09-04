import { Box, Button, Card, Text, useMediaQuery } from '@0xsequence/design-system'

import { usePublicClient, useWalletClient, useAccount } from 'wagmi'

import { useClearCachedBalances, useCheckoutModal, useSelectPaymentModal } from '../../hooks'
import { PayWithCreditCardSettings } from '../../contexts'

interface PayWithCreditCardProps {
  settings: PayWithCreditCardSettings
}

export const PayWithCreditCard = ({
  settings
}: PayWithCreditCardProps) => {
  const { address: userAddress, connector } = useAccount()
  const isMobile = useMediaQuery('isMobile')
  const { data: walletClient } = useWalletClient()
  const publicClient = usePublicClient()
  const { clearCachedBalances } = useClearCachedBalances()
  const { closeSelectPaymentModal } = useSelectPaymentModal()
  const { triggerCheckout } = useCheckoutModal()

  const onClickPurchase = () => {

  }

  return (
    <Card
      width="full"
      flexDirection={isMobile ? 'column' : 'row'}
      alignItems="center"
      justifyContent="space-between"
      gap={isMobile ? '2' : '0'}
      style={{
        minHeight: '200px'
      }}
    >
      <Box justifyContent={isMobile ? 'center' : 'flex-start'}>
        <Text color="text100">Buy With Credit</Text>
      </Box>
      <Box
        flexDirection="column"
        gap="2"
        alignItems={isMobile ? 'center' : 'flex-start'}
        style={{ ...(isMobile ? { width: '200px' } : {}) }}
      >
        <Button
          label="Purchase"
          onClick={onClickPurchase}
          variant="primary"
          shape="square"
        />
      </Box>
    </Card>
  )
}