import { useEffect } from 'react'
import {
  ArrowRightIcon,
  Box,
  Card,
  PaymentsIcon,
  SendIcon,
  Spinner,
  Text,
  Scroll,
  useMediaQuery
} from '@0xsequence/design-system'
import { useContractInfo } from '@0xsequence/kit'
import { findSupportedNetwork } from '@0xsequence/network'
import { useState } from 'react'
import { useAccount } from 'wagmi'

import { SelectPaymentSettings } from '../../../contexts'
import { CheckoutSettings } from '../../../contexts/CheckoutModal'
import { useClearCachedBalances, useCheckoutModal, useSelectPaymentModal } from '../../../hooks'

interface PayWithCreditCardProps {
  settings: SelectPaymentSettings
  disableButtons: boolean
}

type PaymentProviderOptions = 'sardine'

export const PayWithCreditCard = ({ settings, disableButtons }: PayWithCreditCardProps) => {
  const {
    chain,
    currencyAddress,
    targetContractAddress,
    price,
    txData,
    collectibles,
    collectionAddress,
    isDev = false,
    onSuccess = () => {},
    onError = () => {},
    creditCardProviders = []
  } = settings

  const { address: userAddress } = useAccount()
  const isMobile = useMediaQuery('isMobile')
  const { clearCachedBalances } = useClearCachedBalances()
  const { closeSelectPaymentModal } = useSelectPaymentModal()
  const { triggerCheckout } = useCheckoutModal()
  const network = findSupportedNetwork(chain)
  const chainId = network?.chainId || 137
  const { data: currencyInfoData, isLoading: isLoadingContractInfo } = useContractInfo(chainId, currencyAddress)
  const [selectedPaymentProvider, setSelectedPaymentProvider] = useState<PaymentProviderOptions>()
  const isLoading = isLoadingContractInfo

  useEffect(() => {
    if (selectedPaymentProvider) {
      payWithSelectedProvider()
    }
  }, [selectedPaymentProvider])

  const payWithSelectedProvider = () => {
    switch (selectedPaymentProvider) {
      case 'sardine':
        onPurchaseSardine()
        return
      default:
        return
    }
  }

  const onPurchaseSardine = () => {
    if (!userAddress || !currencyInfoData) {
      return
    }

    const collectible = collectibles[0]

    const checkoutSettings: CheckoutSettings = {
      creditCardCheckout: {
        onSuccess: (txHash: string) => {
          clearCachedBalances()
          onSuccess(txHash)
        },
        onError,
        chainId,
        recipientAddress: userAddress,
        contractAddress: targetContractAddress,
        currencyQuantity: price,
        currencySymbol: currencyInfoData.symbol,
        currencyAddress,
        currencyDecimals: String(currencyInfoData?.decimals || 0),
        nftId: collectible.tokenId,
        nftAddress: collectionAddress,
        nftQuantity: collectible.quantity,
        nftDecimals: collectible.decimals,
        isDev,
        calldata: txData,
        approvedSpenderAddress: targetContractAddress
      }
    }

    closeSelectPaymentModal()
    triggerCheckout(checkoutSettings)
  }

  const Options = () => {
    return (
      <Box flexDirection="column" justifyContent="center" alignItems="center" gap="2" width="full">
        {creditCardProviders.map(creditCardProvider => {
          switch (creditCardProvider) {
            case 'sardine':
              return (
                <Card
                  key="sardine"
                  justifyContent="space-between"
                  alignItems="center"
                  padding="4"
                  onClick={() => {
                    setSelectedPaymentProvider('sardine')
                  }}
                  opacity={{
                    hover: '80',
                    base: '100'
                  }}
                  cursor="pointer"
                  disabled={disableButtons}
                >
                  <Box flexDirection="row" gap="3" alignItems="center">
                    <PaymentsIcon color="white" />
                    <Text color="text100" variant="normal" fontWeight="bold">
                      Pay with credit or debit card
                    </Text>
                  </Box>
                  <Box style={{ transform: 'rotate(-45deg)' }}>
                    <ArrowRightIcon color="white" />
                  </Box>
                </Card>
              )
            default:
              return null
          }
        })}
      </Box>
    )
  }

  return (
    <Box width="full">
      {isLoading ? (
        <Box width="full" paddingTop="5" justifyContent="center" alignItems="center">
          <Spinner />
        </Box>
      ) : (
        <Options />
      )}
    </Box>
  )
}
