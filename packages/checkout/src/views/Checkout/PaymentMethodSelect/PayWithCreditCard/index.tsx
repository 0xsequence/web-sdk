import { Button, Spinner, Text } from '@0xsequence/design-system'
import { useClearCachedBalances, useGetContractInfo } from '@0xsequence/hooks'
import { findSupportedNetwork } from '@0xsequence/network'
import { useAccount } from 'wagmi'

import type { CheckoutSettings } from '../../../../contexts/CheckoutModal.js'
import { useCheckoutModal, useSelectPaymentModal, useSkipOnCloseCallback } from '../../../../hooks/index.js'

type BasePaymentProviderOptions = 'sardine' | 'transak'

export const PayWithCreditCardTab = () => {
  const { closeSelectPaymentModal, selectPaymentSettings } = useSelectPaymentModal()
  const {
    chain,
    currencyAddress,
    targetContractAddress,
    price,
    txData,
    collectibles,
    collectionAddress,
    sardineConfig,
    onSuccess = () => {},
    onError = () => {},
    onClose = () => {},
    creditCardProviders = [],
    transakConfig,
    supplementaryAnalyticsInfo = {}
  } = selectPaymentSettings!

  const { address: userAddress } = useAccount()
  const { clearCachedBalances } = useClearCachedBalances()
  const { triggerCheckout } = useCheckoutModal()
  const network = findSupportedNetwork(chain)
  const chainId = network?.chainId || 137
  const { skipOnCloseCallback } = useSkipOnCloseCallback(onClose)
  const selectedPaymentProvider = creditCardProviders?.[0]

  const { data: currencyInfoData, isLoading: isLoadingContractInfo } = useGetContractInfo({
    chainID: String(chainId),
    contractAddress: currencyAddress ?? ''
  })

  const isLoading = isLoadingContractInfo

  const payWithSelectedProvider = () => {
    switch (selectedPaymentProvider) {
      case 'custom':
        if (selectPaymentSettings?.customProviderCallback) {
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
    if (selectPaymentSettings?.customProviderCallback) {
      closeSelectPaymentModal()
      selectPaymentSettings.customProviderCallback(onSuccess, onError, onClose)
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
        nftId: collectible.tokenId ?? '',
        nftAddress: collectionAddress,
        nftQuantity: collectible.quantity,
        nftDecimals: collectible.decimals === undefined ? undefined : String(collectible.decimals),
        provider: selectedPaymentProvider as BasePaymentProviderOptions,
        calldata: txData,
        transakConfig,
        approvedSpenderAddress: sardineConfig?.approvedSpenderAddress || targetContractAddress,
        supplementaryAnalyticsInfo
      }
    }

    skipOnCloseCallback()
    closeSelectPaymentModal()
    triggerCheckout(checkoutSettings)
  }

  if (isLoading) {
    return (
      <div className="flex h-full w-full pt-5 justify-center items-center">
        <Spinner />
      </div>
    )
  }

  const getProviderName = () => {
    switch (selectedPaymentProvider) {
      case 'sardine':
        return 'Sardine'
      case 'transak':
        return 'Transak'
      case 'forte':
        return 'Forte'
      default:
        return null
    }
  }
  return (
    <div className="flex flex-col gap-2 justify-between h-full">
      <Text color="text50" variant="small">
        Buy directly with your debit or credit card {getProviderName() ? `through ${getProviderName()}` : ''}
      </Text>
      <div className="flex flex-col justify-center items-center gap-2 w-full h-full">
        <Button className="w-full" shape="square" onClick={payWithSelectedProvider} label="Continue" variant="primary" />
      </div>
    </div>
  )
}
