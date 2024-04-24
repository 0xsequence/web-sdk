import React from 'react'
import { ethers } from 'ethers'
import { Box, Button, ChevronRightIcon, Divider, Text, PaymentsIcon, vars } from '@0xsequence/design-system'

import { getNativeTokenInfoByChainId } from '@0xsequence/kit'

import { useAccount, useConfig } from 'wagmi'

import { OrderSummaryItem } from './component/OrderSummaryItem'

import { CoinIcon } from '../../shared/components/CoinIcon'
import { Skeleton } from '../../shared/components/Skeleton'
import { HEADER_HEIGHT } from '../../constants'
import { useNavigation, useCheckoutModal, useBalances, useContractInfo } from '../../hooks'
import { compareAddress, formatDisplay } from '../../utils'
import * as styles from './styles.css'

export const CheckoutSelection = () => {
  const { chains } = useConfig()
  const { setNavigation } = useNavigation()
  const { closeCheckout, settings } = useCheckoutModal()
  const { address: accountAddress } = useAccount()

  const cryptoCheckoutSettings = settings?.cryptoCheckout
  // const creditCardCheckoutSettings = settings?.creditCardCheckout
  const displayCryptoCheckout = !!cryptoCheckoutSettings
  // const displayCreditCardCheckout = !!creditCardCheckoutSettings

  const { data: contractInfoData, isPending: isPendingContractInfo } = useContractInfo({
    contractAddress: cryptoCheckoutSettings?.coinQuantity?.contractAddress || '',
    chainID: String(cryptoCheckoutSettings?.chainId || 1)
  })

  const { data: balancesData, isPending: isPendingBalances } = useBalances({
    accountAddress: accountAddress || '',
    chainId: cryptoCheckoutSettings?.chainId || 1
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

  const chainId = settings?.cryptoCheckout?.chainId || 1

  const onClickPayWithCard = () => {
    setNavigation({
      location: 'transaction-form'
    })
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
          <Text fontWeight="normal" fontSize="normal" color="text50">
            Order summary
          </Text>
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
            <Skeleton width="100px" height="17px" />
          ) : (
            <Box flexDirection="row" gap="1" alignItems="center">
              <CoinIcon imageUrl={coinImageUrl} size={12} />
              <Text fontWeight="normal" fontSize="normal" color="text100">
                {`${formatDisplay(requestAmount)} ${coinSymbol}`}
              </Text>
            </Box>
          )}
        </Box>
      )}

      <Box flexDirection="column" alignItems="center" justifyContent="center" gap="2">
        {/* {displayCreditCardCheckout && (
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
        )} */}
        {displayCryptoCheckout && !isInsufficientBalance && !isPending && (
          <Button
            style={{
              borderRadius: vars.radii.md,
              height: '56px'
            }}
            width="full"
            leftIcon={() => <CoinIcon size={20} imageUrl={coinImageUrl} />}
            variant="primary"
            label={`Pay with ${coinSymbol}`}
            rightIcon={ChevronRightIcon}
            onClick={onClickPayWithCrypto}
          />
        )}
        {displayCryptoCheckout && (isInsufficientBalance || isPending) && (
          <Button
            className={styles.insufficientBalanceButton}
            style={{
              borderRadius: vars.radii.md,
              height: '56px',
              justifyContent: 'center'
            }}
            width="full"
            leftIcon={() => <CoinIcon size={20} imageUrl={coinImageUrl} />}
            variant="glass"
            label={`Insufficient ${coinSymbol}`}
            onClick={onClickPayWithCrypto}
            disabled
          />
        )}
      </Box>
      {displayCryptoCheckout && (
        <Box width="full" justifyContent="flex-end">
          {isPending ? (
            <Skeleton width="102px" height="14px" />
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
