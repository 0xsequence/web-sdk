import {
  Box,
  Button,
  ChevronRightIcon,
  Divider,
  HelpIcon,
  Text,
  Tooltip,
  PaymentsIcon,
  vars,
  Skeleton,
  TokenImage
} from '@0xsequence/design-system'
import { getNativeTokenInfoByChainId, useBalances, useContractInfo, useTokenMetadata, useProjectAccessKey } from '@0xsequence/kit'
import { ethers } from 'ethers'
import React from 'react'
import { useAccount, useConfig } from 'wagmi'

import { fetchSardineClientToken } from '../../api'
import { HEADER_HEIGHT } from '../../constants'
import { useNavigation, useCheckoutModal } from '../../hooks'
import { compareAddress, formatDisplay } from '../../utils'

import { OrderSummaryItem } from './component/OrderSummaryItem'

export const CheckoutSelection = () => {
  const { chains } = useConfig()
  const { setNavigation } = useNavigation()
  const { closeCheckout, settings } = useCheckoutModal()
  const { address: accountAddress } = useAccount()
  const projectAccessKey = useProjectAccessKey()

  const cryptoCheckoutSettings = settings?.cryptoCheckout
  const creditCardCheckoutSettings = settings?.sardineCheckout
  const displayCreditCardCheckout = !!creditCardCheckoutSettings
  const displayCryptoCheckout = !!cryptoCheckoutSettings

  const { data: contractInfoData, isLoading: isPendingContractInfo } = useContractInfo(
    cryptoCheckoutSettings?.chainId || 1,
    cryptoCheckoutSettings?.coinQuantity?.contractAddress || ''
  )

  const { data: balancesData, isPending: isPendingBalances } = useBalances({
    chainIds: [cryptoCheckoutSettings?.chainId || 1],
    accountAddress: accountAddress || ''
  })

  const isPending = (isPendingContractInfo || isPendingBalances) && cryptoCheckoutSettings

  const isNativeToken = compareAddress(cryptoCheckoutSettings?.coinQuantity?.contractAddress || '', ethers.constants.AddressZero)
  const nativeTokenInfo = getNativeTokenInfoByChainId(cryptoCheckoutSettings?.chainId || 1, chains)

  const coinDecimals = isNativeToken ? nativeTokenInfo.decimals : contractInfoData?.decimals || 0
  const coinSymbol = isNativeToken ? nativeTokenInfo.symbol : contractInfoData?.symbol || 'COIN'
  const coinImageUrl = isNativeToken ? nativeTokenInfo.logoURI : contractInfoData?.logoURI || ''
  const coinBalance = balancesData?.find(balance =>
    compareAddress(balance.contractAddress, cryptoCheckoutSettings?.coinQuantity?.contractAddress || '')
  )
  const userBalanceRaw = coinBalance ? coinBalance.balance : '0'
  const requestedAmountRaw = cryptoCheckoutSettings?.coinQuantity?.amountRequiredRaw || '0'
  const userBalance = ethers.utils.formatUnits(userBalanceRaw, coinDecimals)
  const requestAmount = ethers.utils.formatUnits(requestedAmountRaw, coinDecimals)
  const isInsufficientBalance = ethers.BigNumber.from(userBalanceRaw).lt(ethers.BigNumber.from(requestedAmountRaw))

  const orderSummaryItems = settings?.orderSummaryItems || []

  const chainId = settings?.cryptoCheckout?.chainId || settings?.sardineCheckout?.chainId || 1

  const { data: tokensMetadata } = useTokenMetadata(chainId, orderSummaryItems[0].contractAddress, [orderSummaryItems[0].tokenId])
  const tokenMetadata = tokensMetadata ? tokensMetadata[0] : undefined

  const triggerSardineTransaction = async () => {
    console.log('trigger sardine transaction')

    if (settings?.sardineCheckout) {
      const isDev = settings?.sardineCheckout?.isDev || false
      const { token, orderId } = await fetchSardineClientToken(settings.sardineCheckout, isDev, projectAccessKey, tokenMetadata)

      setNavigation({
        location: 'transaction-pending',
        params: { orderId, authToken: token }
      })
    }
  }

  const onClickPayWithCard = () => {
    if (settings?.sardineCheckout) {
      triggerSardineTransaction()
    } else {
      setNavigation({
        location: 'transaction-form'
      })
    }
  }

  const onClickPayWithCrypto = () => {
    console.log('trigger transaction')
    const transaction = settings?.cryptoCheckout?.triggerTransaction
    transaction && transaction()
    closeCheckout()
  }

  return (
    <Box
      paddingX="5"
      paddingBottom="5"
      style={{
        marginTop: HEADER_HEIGHT
      }}
      flexDirection="column"
      gap="3"
    >
      {orderSummaryItems.length > 0 && (
        <>
          <Box flexDirection="row" gap="2" alignItems="center">
            <Text fontWeight="normal" fontSize="normal" color="text50">
              Order summary
            </Text>
            <Tooltip
              vOffset={-2}
              side="bottom"
              message={
                <>
                  Please note that NFTs are digital assets
                  <br /> ,and as such, cannot be delivered physically.
                </>
              }
            >
              <Box width="5" height="5">
                <HelpIcon color="text80" />
              </Box>
            </Tooltip>
          </Box>
          <Box flexDirection="column" gap="2">
            {orderSummaryItems.map((orderSummaryItem, index) => {
              return <OrderSummaryItem key={index} {...orderSummaryItem} chainId={chainId} />
            })}
          </Box>
          <Box marginTop="2">
            <Divider
              color="backgroundSecondary"
              style={{
                margin: '0px'
              }}
            />
          </Box>
        </>
      )}

      {displayCryptoCheckout && (
        <Box justifyContent="space-between" alignItems="center">
          <Text fontWeight="normal" fontSize="normal" color="text50">
            Total
          </Text>
          {isPending ? (
            <Skeleton style={{ width: '100px', height: '17px' }} />
          ) : (
            <Box flexDirection="row" gap="1" alignItems="center">
              <TokenImage src={coinImageUrl} size="xs" />
              <Text fontWeight="normal" fontSize="normal" color="text100">
                {`${formatDisplay(requestAmount)} ${coinSymbol}`}
              </Text>
            </Box>
          )}
        </Box>
      )}

      <Box flexDirection="column" alignItems="center" justifyContent="center" gap="2">
        {displayCreditCardCheckout && (
          <Button
            style={{
              borderRadius: vars.radii.md,
              height: '56px'
            }}
            width="full"
            borderRadius="md"
            leftIcon={PaymentsIcon}
            variant="primary"
            label="Pay with credit card"
            rightIcon={ChevronRightIcon}
            onClick={onClickPayWithCard}
          />
        )}
        {displayCryptoCheckout && !isInsufficientBalance && !isPending && (
          <Button
            style={{
              borderRadius: vars.radii.md,
              height: '56px'
            }}
            width="full"
            leftIcon={() => <TokenImage src={coinImageUrl} size="sm" />}
            variant="primary"
            label={`Pay with ${coinSymbol}`}
            rightIcon={ChevronRightIcon}
            onClick={onClickPayWithCrypto}
          />
        )}
        {displayCryptoCheckout && (isInsufficientBalance || isPending) && (
          <Button
            shape="square"
            width="full"
            variant="glass"
            label={
              <Box placeItems="center" gap="2">
                <TokenImage src={coinImageUrl} size="sm" />
                <Text>Insufficient ${coinSymbol}</Text>
              </Box>
            }
            onClick={onClickPayWithCrypto}
            disabled
          />
        )}
      </Box>
      {displayCryptoCheckout && (
        <Box width="full" justifyContent="flex-end">
          {isPending ? (
            <Skeleton style={{ width: '102px', height: '14px' }} />
          ) : (
            <Text fontWeight="bold" fontSize="small" color="text50">
              Balance: {`${formatDisplay(userBalance)} ${coinSymbol}`}
            </Text>
          )}
        </Box>
      )}
    </Box>
  )
}
