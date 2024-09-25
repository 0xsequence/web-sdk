import { Box, Button, Card, Spinner, Text, Scroll, useMediaQuery } from '@0xsequence/design-system'
import { useContractInfo } from '@0xsequence/kit'
import { findSupportedNetwork } from '@0xsequence/network'
import { useState } from 'react'
import { useAccount } from 'wagmi'

import { SelectPaymentSettings } from '../../../contexts'
import { CheckoutSettings } from '../../../contexts/CheckoutModal'
import { useClearCachedBalances, useCheckoutModal, useSelectPaymentModal } from '../../../hooks'
import { getCardHeight } from '../../../utils/sizing'

import { PaymentProviderOption } from './PaymentProviderOption'
import { SardineLogo } from './providers/SardineLogo'

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
    tokenId,
    collectionAddress,
    nftQuantity,
    nftDecimals = '0',
    isDev = false,
    onSuccess = () => {},
    onError = () => {}
  } = settings

  const { address: userAddress } = useAccount()
  const isMobile = useMediaQuery('isMobile')
  const { clearCachedBalances } = useClearCachedBalances()
  const { closeSelectPaymentModal } = useSelectPaymentModal()
  const { triggerCheckout } = useCheckoutModal()
  const network = findSupportedNetwork(chain)
  const chainId = network?.chainId || 137
  const { data: currencyInfoData, isLoading: isLoadingContractInfo } = useContractInfo(chainId, currencyAddress)
  const [selectedPaymentProvider, setSelecterPaymentProvider] = useState<PaymentProviderOptions>()
  const isLoading = isLoadingContractInfo

  const onClickPurchase = () => {
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
        nftId: tokenId,
        nftAddress: collectionAddress,
        nftQuantity,
        nftDecimals: nftDecimals,
        isDev,
        calldata: txData,
        approvedSpenderAddress: targetContractAddress
      }
    }

    closeSelectPaymentModal()
    triggerCheckout(checkoutSettings)
  }

  if (isLoading) {
    return (
      <Card
        width="full"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        style={{
          minHeight: getCardHeight(isMobile)
        }}
      >
        <Spinner />
      </Card>
    )
  }

  const Options = () => {
    return (
      <Box flexDirection="column" justifyContent="center" alignItems="center" gap="2" width="full">
        <PaymentProviderOption
          name="Sardine"
          logo={SardineLogo()}
          onClick={() => {
            setSelecterPaymentProvider('sardine')
          }}
          isSelected={selectedPaymentProvider === 'sardine'}
          isRecommended={true}
        />
      </Box>
    )
  }

  return (
    <Box>
      <Box marginTop="3" flexDirection="column" gap="1">
        <Text variant="medium" fontWeight="medium" color="text80">
          Debit and credit card
        </Text>
        <Text variant="small" fontWeight="medium" color="text50">
          Select a payment provider to purchase crypto directly
        </Text>
      </Box>
      <Scroll paddingTop="3" style={{ height: '312px' }}>
        {isLoading ? (
          <Box width="full" paddingTop="5" justifyContent="center" alignItems="center">
            <Spinner />
          </Box>
        ) : (
          <Options />
        )}
      </Scroll>
      <Button
        onClick={onClickPurchase}
        disabled={isLoading || disableButtons || !selectedPaymentProvider}
        marginTop="2"
        shape="square"
        variant="primary"
        width="full"
        label="Complete Purchase"
      />
    </Box>
  )
}
