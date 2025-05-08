import { CreditCardProviders, useCheckoutUI } from '@0xsequence/checkout'
import { CryptoOption } from '@0xsequence/connect'
import { Button, Image, NetworkImage, Spinner, Text } from '@0xsequence/design-system'
import { useState } from 'react'
import { encodeFunctionData, toHex } from 'viem'
import { useAccount } from 'wagmi'

import { ERC_1155_SALE_CONTRACT } from '../../constants/erc1155-sale-contract'

export const CustomCheckout = () => {
  const { address } = useAccount()

  // NATIVE token sale
  // const currencyAddress = zeroAddress
  // const salesContractAddress = '0xf0056139095224f4eec53c578ab4de1e227b9597'
  // const collectionAddress = '0x92473261f2c26f2264429c451f70b0192f858795'
  // const price = '200000000000000'
  // const contractId = '674eb55a3d739107bbd18ecb'

  // // ERC-20 contract
  const currencyAddress = '0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359'
  const salesContractAddress = '0xe65b75eb7c58ffc0bf0e671d64d0e1c6cd0d3e5b'
  const collectionAddress = '0xdeb398f41ccd290ee5114df7e498cf04fac916cb'
  const price = '20000'
  const contractId = '674eb5613d739107bbd18ed2'

  const chainId = 137

  const collectible = {
    tokenId: '1',
    quantity: '1'
  }

  const purchaseTransactionData = encodeFunctionData({
    abi: ERC_1155_SALE_CONTRACT,
    functionName: 'mint',
    // [to, tokenIds, amounts, data, expectedPaymentToken, maxTotal, proof]
    args: [
      address,
      [BigInt(collectible.tokenId)],
      [BigInt(collectible.quantity)],
      toHex(0),
      currencyAddress,
      price,
      [toHex(0, { size: 32 })]
    ]
  })

  const checkoutUIParams = {
    collectible,
    chain: chainId,
    totalPriceRaw: price,
    targetContractAddress: salesContractAddress,
    recipientAddress: address || '',
    currencyAddress,
    collectionAddress,
    creditCardProvider: 'transak' as CreditCardProviders,
    transakConfig: {
      contractId,
      apiKey: '5911d9ec-46b5-48fa-a755-d59a715ff0cf'
    },
    onSuccess: (txnHash: string) => {
      console.log('success!', txnHash)
    },
    onError: (error: Error) => {
      console.error(error)
    },
    txData: purchaseTransactionData
  }

  const { orderSummary, creditCardPayment, cryptoPayment } = useCheckoutUI(checkoutUIParams)

  const OrderSummary = () => {
    if (orderSummary.isLoading) {
      return <Spinner />
    }

    if (orderSummary.error) {
      return <Text color="negative">Error loading order summary</Text>
    }

    return (
      <div className="flex flex-col gap-2">
        <div className="flex flex-row gap-1">
          <div className="flex gap-3 items-center" key={collectible.tokenId}>
            <div
              className="rounded-xl"
              style={{
                height: '36px',
                width: '36px'
              }}
            >
              <Image disableAnimation src={orderSummary.data?.collectibleItem?.collectibleImageUrl} />
            </div>
            <div className="flex flex-col gap-0.5">
              <Text variant="small" color="secondary" fontWeight="medium">
                {orderSummary.data?.collectibleItem?.collectionName}
              </Text>
              <Text variant="small" color="primary" fontWeight="bold">
                {`${orderSummary.data?.collectibleItem?.collectibleName} x${orderSummary.data?.collectibleItem?.quantityFormatted}`}
              </Text>
            </div>
          </div>
        </div>
        <div className="flex gap-1 flex-col">
          <div className="flex flex-row gap-2 items-center">
            <NetworkImage disableAnimation chainId={chainId} size="sm" />
            <Text
              color="white"
              variant="large"
              fontWeight="bold"
            >{`${orderSummary?.data?.formattedCryptoPrice} ${orderSummary?.data?.cryptoSymbol}`}</Text>
          </div>
          <div>
            <Text color="muted" variant="normal" fontWeight="normal">
              {`$${orderSummary?.data?.totalPriceFiat} estimated total`}
            </Text>
          </div>
        </div>
      </div>
    )
  }

  const CreditCardPayment = () => {
    const [showCreditCardPayment, setShowCreditCardPayment] = useState(false)
    if (creditCardPayment.isLoading) {
      return <Spinner />
    }

    if (creditCardPayment.error) {
      return <Text color="negative">Error loading credit card payment</Text>
    }

    const CreditCardIframe = creditCardPayment.data?.CreditCardIframe
    const EventListener = creditCardPayment.data?.EventListener

    if (showCreditCardPayment) {
      return (
        <div>
          <CreditCardIframe />
          <EventListener />
        </div>
      )
    }

    return <Button onClick={() => setShowCreditCardPayment(true)}>Show Credit Card Payment</Button>
  }

  const CryptoPayment = () => {
    if (cryptoPayment.cryptoOptions.data.length === 0) {
      return <Spinner />
    }

    if (cryptoPayment.cryptoOptions.error) {
      return <Text color="negative">Error loading crypto payment</Text>
    }

    return (
      <div className="flex flex-col gap-2">
        {cryptoPayment.cryptoOptions.data.map(option => (
          <CryptoOption
            key={option.address}
            currencyName={option.name}
            chainId={option.chainId}
            symbol={option.symbol}
            price={option.totalPriceDisplay}
            onClick={() => {
              cryptoPayment.purchaseAction.setSelectedCurrencyAddress(option.address)
            }}
            isSelected={option.isSelected}
            showInsufficientFundsWarning={option.isInsufficientFunds}
            disabled={option.isInsufficientFunds}
          />
        ))}
        {cryptoPayment.cryptoOptions.isLoading && <Spinner />}
        <Button onClick={cryptoPayment.purchaseAction.action} disabled={!cryptoPayment.purchaseAction.isReady}>
          Purchase
        </Button>
      </div>
    )
  }

  return (
    <div className="flex pt-16 pb-8 px-6 gap-2 flex-col">
      <Text color="primary">The following data is generated by the useCheckoutUI hook</Text>
      <Text variant="large" fontWeight="bold" color="primary">
        Order Summary section
      </Text>
      <OrderSummary />
      <Text variant="large" fontWeight="bold" color="primary">
        Crypto Payment section
      </Text>
      <CryptoPayment />
      <Text variant="large" fontWeight="bold" color="primary">
        Credit Card Payment section
      </Text>
      <CreditCardPayment />
    </div>
  )
}

export default CustomCheckout
