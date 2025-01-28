import { findSupportedNetwork } from '@0xsequence/network'
import { ArrowRightIcon, Box, Card, CurrencyIcon, Text } from '@0xsequence/design-system'
import { TransactionOnRampProvider } from '@0xsequence/marketplace'

import { useSelectPaymentModal, useAddFundsModal } from '../../hooks'

interface FundWithFiatProps {
  walletAddress: string
  provider: TransactionOnRampProvider
  chainId?: number
}

export const FundWithFiat = ({ walletAddress, provider, chainId }: FundWithFiatProps) => {
  const { triggerAddFunds } = useAddFundsModal()
  const { closeSelectPaymentModal, selectPaymentSettings } = useSelectPaymentModal()

  const getNetworks = (): string | undefined => {
    const chain = selectPaymentSettings?.chain
    if (!chain) return

    const network = findSupportedNetwork(chain)
    return network?.name?.toLowerCase()
  }

  const onClick = () => {
    closeSelectPaymentModal()
    triggerAddFunds({
      walletAddress,
      provider,
      networks: getNetworks()
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
          Fund wallet with credit card
        </Text>
      </Box>
      <Box style={{ transform: 'rotate(-45deg)' }}>
        <ArrowRightIcon color="white" />
      </Box>
    </Card>
  )
}
