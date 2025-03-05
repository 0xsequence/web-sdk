import { ArrowRightIcon, Box, Card, PaymentsIcon, Spinner, Text } from '@0xsequence/design-system'
import { useContractInfo } from '@0xsequence/kit'
import { findSupportedNetwork } from '@0xsequence/network'
import { useEffect, useState } from 'react'
import { useAccount } from 'wagmi'

import { SelectPaymentSettings } from '../../../contexts'
import { CheckoutSettings } from '../../../contexts/CheckoutModal'
import { useClearCachedBalances, useCheckoutModal, useSelectPaymentModal } from '../../../hooks'

interface PayWithCreditCardProps {
  settings: SelectPaymentSettings
  disableButtons: boolean
  skipOnCloseCallback: () => void
}

type BasePaymentProviderOptions = 'sardine' | 'transak'
type CustomPaymentProviderOptions = 'custom'
type PaymentProviderOptions = BasePaymentProviderOptions | CustomPaymentProviderOptions

export const PayWithCreditCard = ({ settings, disableButtons, skipOnCloseCallback }: PayWithCreditCardProps) => {
  const {
    chain,
    currencyAddress,
    targetContractAddress,
    price,
    txData,
    collectibles,
    collectionAddress,
    approvedSpenderAddress,
    onSuccess = () => {},
    onError = () => {},
    onClose = () => {},
    creditCardProviders = [],
    transakConfig
  } = settings

  const { address: userAddress } = useAccount()
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
      case 'custom':
        if (settings.customProviderCallback) {
          onClickCustomProvider()
        }
        return
      case 'sardine':
      case 'transak':
        onPurchase()
        return
      default:
        return
    }
  }

  const onClickCustomProvider = () => {
    if (settings.customProviderCallback) {
      closeSelectPaymentModal()
      settings.customProviderCallback(onSuccess, onError, onClose)
    }
  }

  const onPurchase = () => {
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
        onClose,
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
        nftDecimals: collectible.decimals === undefined ? undefined : String(collectible.decimals),
        provider: selectedPaymentProvider as BasePaymentProviderOptions,
        calldata: txData,
        transakConfig,
        approvedSpenderAddress: approvedSpenderAddress || targetContractAddress
      }
    }

    skipOnCloseCallback()
    closeSelectPaymentModal()
    triggerCheckout(checkoutSettings)
  }

  const Options = () => {
    return (
      <Box flexDirection="column" justifyContent="center" alignItems="center" gap="2" width="full">
        {/* Only 1 option will be displayed, even if multiple providers are passed */}
        {creditCardProviders
          .slice(0, 1)
          .filter(provider => {
            // cannot display transak checkout if the settings aren't provided
            if (provider === 'transak' && !settings.transakConfig) {
              return false
            }
            return true
          })
          .map(creditCardProvider => {
            switch (creditCardProvider) {
              case 'sardine':
              case 'transak':
              case 'custom':
                return (
                  <Card
                    key="sardine"
                    justifyContent="space-between"
                    alignItems="center"
                    padding="4"
                    onClick={() => {
                      setSelectedPaymentProvider(creditCardProvider)
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
