import { useContractInfo } from '@0xsequence/kit'
import {
  Box,
  Button,
  Card,
  Spinner,
  Text,
  useMediaQuery
} from '@0xsequence/design-system'
import { findSupportedNetwork } from '@0xsequence/network'

import { useAccount } from 'wagmi'

import { useClearCachedBalances, useCheckoutModal, useSelectPaymentModal } from '../../hooks'
import { SelectPaymentSettings } from '../../contexts'
import { CheckoutSettings } from '../../contexts/CheckoutModal'
import { getCardHeight } from '../../utils/sizing'

interface PayWithCreditCardProps {
  settings: SelectPaymentSettings
  disableButtons: boolean
}

export const PayWithCreditCard = ({
  settings,
  disableButtons,
}: PayWithCreditCardProps) => {
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
    onError = () => {},
  } = settings

  const { address: userAddress } = useAccount()
  const isMobile = useMediaQuery('isMobile')
  const { clearCachedBalances } = useClearCachedBalances()
  const { closeSelectPaymentModal } = useSelectPaymentModal()
  const { triggerCheckout } = useCheckoutModal()
  const network = findSupportedNetwork(chain)
  const chainId = network?.chainId || 137
  const { data: currencyInfoData, isLoading: isLoadingContractInfo } = useContractInfo(
    chainId,
    currencyAddress
  )
  const isLoading = isLoadingContractInfo

  const onClickPurchase = () => {
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
        approvedSpenderAddress: targetContractAddress,
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
        <Text variant="normal" color="text100">Buy With Credit Card</Text>
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