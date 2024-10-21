# Sequence Kit Checkout

<div align="center">
  <img src="../../public/docs/checkout-modal.png">
</div>

Checkout modal for Sequence Kit. Displays a list a summary of collectibles to be purchased

# Installing the module

First install the package:

```bash
npm install @0xsequence/kit-checkout
# or
pnpm install @0xsequence/kit-checkout
# or
yarn add @0xsequence/kit-checkout
```

Then the wallet provider module must placed below the Sequence Kit Core provider.

```js
import { KitCheckoutProvider } from '@0xsequence/kit-checkout'

const App = () => {
  return (
    <SequenceKit config={config}>
      <KitCheckoutProvider>
        <Page />
      </KitCheckoutProvider>
    </SequenceKit>
  )
}
```

## Open the checkout modal

The `useCheckoutModal` hook must be used to open the modal.
Furthermore, it is necessary to pass a settings object.

```js
  import { useCheckoutModal } from '@0xsequence/kit-checkout'


  const MyComponent = () => {
    const { triggerCheckout } = useCheckoutModal()

    const onClick = () => {
      const checkoutSettings = {...}
      triggerCheckout(checkoutSettings)
    }

    return (
      <button onClick={onClick}>checkout</button>
    )
  }

```

## Configuration

The react example has an example configuration for setting up the checkout.

Example [settings](../../examples/react/src/utils/settings.ts)

```js
const checkoutSettings = {
  creditCardCheckout: {...},
  cryptoCheckout: {...},
  orderSummaryItems: {...}
}
```

### cryptoCheckout

The `cryptoCheckout` specifies settings regarding checking out with crypto.
An example usecase might be interacting with a minting contract.

The actual cryptoTransaction must be passed down to `triggerCheckout`.

```js
const checkoutConfig = {
  {...},
  cryptoCheckout: {
    chainId: 137,
    triggerTransaction: async () => { console.log('triggered transaction') },
    coinQuantity: {
      contractAddress: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
      amountRequiredRaw: '10000000000'
    },
  },
}
```

### creditCardCheckout

The `creditCardCheckout` field specifies settings regarding checking out with credit card.

`triggerCheckout` must be called in order to open the checkout modal.

```js
const creditCardCheckout = {
  {...},
  cryptoCheckout: {
      defaultPaymentMethodType: 'us_debit',
      onSuccess: (hash) => { console.log('credit card checkout success', hash) },
      onError: (e) => { console.log('credit card checkout error', e) },
      chainId,
      contractAddress: orderbookAddress,
      recipientAddress,
      currencyQuantity: '100000',
      currencySymbol: 'USDC',
      currencyAddress: '0x3c499c542cef5e3811e1192ce70d8cc03d5c3359',
      currencyDecimals: '6',
      nftId: checkoutTokenId,
      nftAddress: checkoutTokenContractAddress,
      nftQuantity,
      isDev: true,
      calldata: getOrderbookCalldata({
        orderId: checkoutOrderId,
        quantity: nftQuantity,
        recipient: recipientAddress
      })
  },
}
```

### orderSummaryItems

This field specific the list of collectibles that will show up in the order summary.

```js
orderSummaryItems: [
  {
    contractAddress: '0x631998e91476da5b870d741192fc5cbc55f5a52e',
    tokenId: '66597',
    quantityRaw: '100'
  }
]
```

## Open the Add Funds by Credit Card Modal

Kit allows users to buy cryptocurrencies using credit card. Calling the `triggerAddFunds` function will cause a modal to appear.

```js
import { useAddFundsModal } from '@0xsequence/kit-checkout'

const MyComponent = () => {
  const { triggerAddFunds } = useAddFundsModal()

  const onClick = () => {
    triggerAddFunds({
      walletAddress: recipientAddress
    })
  }

  return <button onClick={onClick}>Add Funds</button>
}
```
