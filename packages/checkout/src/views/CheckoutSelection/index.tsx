import { compareAddress, ContractVerificationStatus, formatDisplay, getNativeTokenInfoByChainId } from '@0xsequence/connect'
import {
  Button,
  ChevronRightIcon,
  Divider,
  HelpIcon,
  PaymentsIcon,
  Skeleton,
  Text,
  TokenImage,
  Tooltip
} from '@0xsequence/design-system'
import { useGetContractInfo, useGetTokenBalancesSummary } from '@0xsequence/hooks'
import { useEffect } from 'react'
import { formatUnits, zeroAddress } from 'viem'
import { useAccount, useConfig } from 'wagmi'

import { HEADER_HEIGHT } from '../../constants/index.js'
import { useCheckoutModal, useNavigation } from '../../hooks/index.js'

import { OrderSummaryItem } from './component/OrderSummaryItem.js'

export const CheckoutSelection = () => {
  const { chains } = useConfig()
  const { setNavigation } = useNavigation()
  const { closeCheckout, settings } = useCheckoutModal()
  const { address: accountAddress } = useAccount()

  const cryptoCheckoutSettings = settings?.cryptoCheckout
  const creditCardCheckoutSettings = settings?.creditCardCheckout
  const displayCreditCardCheckout = !!creditCardCheckoutSettings
  const displayCryptoCheckout = !!cryptoCheckoutSettings

  const { data: contractInfoData, isLoading: isLoadingContractInfo } = useGetContractInfo({
    chainID: String(cryptoCheckoutSettings?.chainId || 1),
    contractAddress: cryptoCheckoutSettings?.coinQuantity?.contractAddress || ''
  })

  const {
    data: balancesData,
    isLoading: isLoadingBalances,
    fetchNextPage: fetchNextBalances,
    hasNextPage: hasNextPageBalances,
    isFetchingNextPage: isFetchingNextPageBalances
  } = useGetTokenBalancesSummary({
    chainIds: [cryptoCheckoutSettings?.chainId || 1],
    filter: {
      accountAddresses: accountAddress ? [accountAddress] : [],
      contractStatus: ContractVerificationStatus.ALL,
      omitNativeBalances: false
    },
    page: { pageSize: 40 }
  })

  useEffect(() => {
    if (hasNextPageBalances && !isFetchingNextPageBalances) {
      fetchNextBalances()
    }
  }, [hasNextPageBalances, isFetchingNextPageBalances])

  const isLoading = (isLoadingContractInfo || isLoadingBalances || isFetchingNextPageBalances) && cryptoCheckoutSettings

  const isNativeToken = compareAddress(cryptoCheckoutSettings?.coinQuantity?.contractAddress || '', zeroAddress)
  const nativeTokenInfo = getNativeTokenInfoByChainId(cryptoCheckoutSettings?.chainId || 1, chains)

  const coinDecimals = isNativeToken ? nativeTokenInfo.decimals : contractInfoData?.decimals || 0
  const coinSymbol = isNativeToken ? nativeTokenInfo.symbol : contractInfoData?.symbol || 'COIN'
  const coinImageUrl = isNativeToken ? nativeTokenInfo.logoURI : contractInfoData?.logoURI || ''
  const coinBalance = balancesData?.pages
    ?.flatMap(page => page.balances)
    .find(balance => compareAddress(balance.contractAddress, cryptoCheckoutSettings?.coinQuantity?.contractAddress || ''))
  const userBalanceRaw = coinBalance ? coinBalance.balance : '0'
  const requestedAmountRaw = cryptoCheckoutSettings?.coinQuantity?.amountRequiredRaw || '0'
  const userBalance = formatUnits(BigInt(userBalanceRaw), coinDecimals)
  const requestAmount = formatUnits(BigInt(requestedAmountRaw), coinDecimals)
  const isInsufficientBalance = BigInt(userBalanceRaw) < BigInt(requestedAmountRaw)

  const orderSummaryItems = settings?.orderSummaryItems || []

  const chainId = settings?.cryptoCheckout?.chainId || settings?.creditCardCheckout?.chainId || 1

  const triggerSardineTransaction = async () => {
    console.log('trigger sardine transaction')

    if (settings?.creditCardCheckout) {
      setNavigation({
        location: 'transaction-pending',
        params: {
          creditCardCheckout: settings.creditCardCheckout
        }
      })
    }
  }

  const onClickPayWithCard = () => {
    if (settings?.creditCardCheckout) {
      triggerSardineTransaction()
    } else {
      setNavigation({
        location: 'transaction-form'
      })
    }
  }

  const onClickPayWithCrypto = () => {
    console.log('trigger transaction')
    settings?.cryptoCheckout?.triggerTransaction?.()
    closeCheckout()
  }

  return (
    <div
      className="flex px-5 pb-5 flex-col gap-3"
      style={{
        marginTop: HEADER_HEIGHT
      }}
    >
      {orderSummaryItems.length > 0 && (
        <>
          <div className="flex flex-row gap-2 items-center">
            <Text variant="normal" color="muted">
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
              <div className="w-5 h-5">
                <HelpIcon className="text-secondary" />
              </div>
            </Tooltip>
          </div>
          <div className="flex flex-col gap-2">
            {orderSummaryItems.map((orderSummaryItem, index) => {
              return <OrderSummaryItem key={index} {...orderSummaryItem} chainId={chainId} />
            })}
          </div>
          <div className="mt-2">
            <Divider
              className="text-background-secondary"
              style={{
                margin: '0px'
              }}
            />
          </div>
        </>
      )}
      {displayCryptoCheckout && (
        <div className="flex justify-between items-center">
          <Text variant="normal" color="muted">
            Total
          </Text>
          {isLoading ? (
            <Skeleton style={{ width: '100px', height: '17px' }} />
          ) : (
            <div className="flex flex-row gap-1 items-center">
              <TokenImage src={coinImageUrl} size="xs" />
              <Text variant="normal" color="primary">
                {`${formatDisplay(requestAmount)} ${coinSymbol}`}
              </Text>
            </div>
          )}
        </div>
      )}
      <div className="flex flex-col items-center justify-center gap-2">
        {displayCreditCardCheckout && (
          <Button
            className="w-full h-14 rounded-xl"
            leftIcon={PaymentsIcon}
            variant="primary"
            label="Pay with credit card"
            rightIcon={ChevronRightIcon}
            onClick={onClickPayWithCard}
          />
        )}
        {displayCryptoCheckout && !isInsufficientBalance && !isLoading && (
          <Button
            className="w-full h-14 rounded-xl"
            leftIcon={() => <TokenImage src={coinImageUrl} size="sm" />}
            variant="primary"
            label={`Pay with ${coinSymbol}`}
            rightIcon={ChevronRightIcon}
            onClick={onClickPayWithCrypto}
          />
        )}
        {displayCryptoCheckout && (isInsufficientBalance || isLoading) && (
          <Button
            className="w-full"
            shape="square"
            variant="glass"
            label={
              <div className="flex items-center justify-center gap-2">
                <TokenImage src={coinImageUrl} size="sm" />
                <Text>Insufficient ${coinSymbol}</Text>
              </div>
            }
            onClick={onClickPayWithCrypto}
            disabled
          />
        )}
      </div>
      {displayCryptoCheckout && (
        <div className="flex w-full justify-end">
          {isLoading ? (
            <Skeleton style={{ width: '102px', height: '14px' }} />
          ) : (
            <Text variant="small" fontWeight="bold" color="muted">
              Balance: {`${formatDisplay(userBalance)} ${coinSymbol}`}
            </Text>
          )}
        </div>
      )}
    </div>
  )
}
