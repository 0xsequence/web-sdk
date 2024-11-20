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

# Sequence Pay Checkout

# Generic Swap

# Fiat Onramp

Kit provides access to a fiat onramp for by enabling users to buy cryptocurrencies using a credit card. Calling the `triggerAddFunds` function will cause a modal with the fiat onramp to appear.

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
