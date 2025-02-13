import { ArrowRightIcon, Box, Card, CurrencyIcon, Text } from '@0xsequence/design-system'
import { TransactionOnRampProvider } from '@0xsequence/marketplace'

import { useSelectPaymentModal, useAddFundsModal } from '../../hooks'

interface FundWithFiatProps {
  walletAddress: string
  provider: TransactionOnRampProvider
}

export const FundWithFiat = ({ walletAddress, provider }: FundWithFiatProps) => {
  const { triggerAddFunds } = useAddFundsModal()
  const { closeSelectPaymentModal } = useSelectPaymentModal()

  const onClick = () => {
    closeSelectPaymentModal()
    triggerAddFunds({
      walletAddress,
      provider
    })
  }

  return (
    <Card
      key="sardine"
      justifyContent="space-between"
      alignItems="center"
      padding="4"
      onClick={onClick}
      opacity={{
        hover: '80',
        base: '100'
      }}
      cursor="pointer"
    >
      <Box flexDirection="row" gap="3" alignItems="center">
        <CurrencyIcon color="white" />
        <Text color="text100" variant="normal" fontWeight="bold">
          Fund wallet with fiat
        </Text>
      </Box>
      <Box style={{ transform: 'rotate(-45deg)' }}>
        <ArrowRightIcon color="white" />
      </Box>
    </Card>
  )
}
