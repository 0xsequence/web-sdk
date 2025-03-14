import { ArrowRightIcon, Card, CurrencyIcon, Text } from '@0xsequence/design-system'
import { TransactionOnRampProvider } from '@0xsequence/marketplace'
import { findSupportedNetwork } from '@0xsequence/network'

import { useSelectPaymentModal, useAddFundsModal } from '../../hooks'

interface FundWithFiatProps {
  cryptoSymbol?: string
  walletAddress: string
  provider: TransactionOnRampProvider
  chainId: number
}

export const FundWithFiat = ({ cryptoSymbol, walletAddress, provider, chainId }: FundWithFiatProps) => {
  const { triggerAddFunds } = useAddFundsModal()
  const { closeSelectPaymentModal } = useSelectPaymentModal()

  const getNetworks = (): string | undefined => {
    const network = findSupportedNetwork(chainId)
    return network?.name?.toLowerCase()
  }

  const onClick = () => {
    closeSelectPaymentModal()
    triggerAddFunds({
      walletAddress,
      provider,
      networks: getNetworks(),
      defaultCryptoCurrency: cryptoSymbol
    })
  }

  return (
    <Card key="sardine" className="flex items-center justify-between p-4 cursor-pointer" onClick={onClick}>
      <div className="flex flex-row gap-3 items-center">
        <CurrencyIcon color="white" />
        <Text color="text100" variant="normal" fontWeight="bold">
          Fund wallet with credit card
        </Text>
      </div>
      <div style={{ transform: 'rotate(-45deg)' }}>
        <ArrowRightIcon color="white" />
      </div>
    </Card>
  )
}
