import { compareAddress, ContractVerificationStatus, formatDisplay, getNativeTokenInfoByChainId } from '@0xsequence/connect'
import {
  Button,
  ChevronRightIcon,
  HelpIcon,
  PaymentsIcon,
  Separator,
  Skeleton,
  Text,
  TokenImage,
  Tooltip
} from '@0xsequence/design-system'
import { useGetContractInfo, useGetTokenBalancesSummary } from '@0xsequence/hooks'
import { useEffect } from 'react'
import { formatUnits, zeroAddress } from 'viem'
import { useConfig, useConnection } from 'wagmi'

import { HEADER_HEIGHT } from '../../constants/index.js'
import { useCheckoutModal, useNavigation } from '../../hooks/index.js'

import { OrderSummaryItem } from './component/OrderSummaryItem.js'

export const CheckoutSelection = () => {
  const { chains } = useConfig()
  const { setNavigation } = useNavigation()
  const { closeCheckout, settings } = useCheckoutModal()
  const { address: accountAddress } = useConnection()

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

  const onClickPayWithCard = () => {
    setNavigation({
      location: 'transaction-form'
    })
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
            <Separator className="m-0" />
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
          <Button className="w-full h-14 rounded-xl" variant="primary" onClick={onClickPayWithCard}>
            <PaymentsIcon />
            Pay with credit card
            <ChevronRightIcon />
          </Button>
        )}
        {displayCryptoCheckout && !isInsufficientBalance && !isLoading && (
          <Button className="w-full h-14 rounded-xl" variant="primary" onClick={onClickPayWithCrypto}>
            <TokenImage src={coinImageUrl} size="sm" />
            {`Pay with ${coinSymbol}`}
            <ChevronRightIcon />
          </Button>
        )}
        {displayCryptoCheckout && (isInsufficientBalance || isLoading) && (
          <Button className="w-full" shape="square" variant="ghost" onClick={onClickPayWithCrypto} disabled>
            <div className="flex items-center justify-center gap-2">
              <TokenImage src={coinImageUrl} size="sm" />
              <Text>Insufficient ${coinSymbol}</Text>
            </div>
          </Button>
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
