import { Box, Button, Card, Text, useMediaQuery } from '@0xsequence/design-system'
import { getCardHeight } from '../../utils/sizing'
import { useAddFundsModal, useSelectPaymentModal } from '../../hooks'
import { useAccount } from 'wagmi'

interface FiatOnRampProps {
  disableButtons: boolean
}

export const FiatOnRamp = ({
  disableButtons
}: FiatOnRampProps) => {
  const isMobile = useMediaQuery('isMobile')
  const {
    closeSelectPaymentModal,
    openSelectPaymentModal,
    selectPaymentSettings
  } = useSelectPaymentModal()
  const { triggerAddFunds } = useAddFundsModal()
  const { address: userAddress } = useAccount()

  const onClickPurchase = () => {
    closeSelectPaymentModal()
    triggerAddFunds({
      walletAddress: userAddress || '',
      onClose: () => {
        setTimeout(() => {
          if (selectPaymentSettings) {
            openSelectPaymentModal(selectPaymentSettings)
          }
        }, 500)
      }
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
        <Text variant="normal" color="text100">Purchase Crypto</Text>
      </Box>
      <Box
        flexDirection="column"
        gap="2"
        alignItems={isMobile ? 'center' : 'flex-start'}
        style={{ ...(isMobile ? { width: '200px' } : {}) }}
      >
        <Button
          disabled={disableButtons}
          label="Purchase"
          onClick={onClickPurchase}
          variant="primary"
          shape="square"
        />
      </Box>
    </Card>
  )
}