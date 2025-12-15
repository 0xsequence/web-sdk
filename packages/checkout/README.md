# Sequence Web SDK Checkout

Sequence Checkout provides a seamless and flexible payment experience for interacting with NFTs, cryptocurrencies, and fiat currencies. It supports multiple payment options, including cryptocurrency transfers, currency swaps, and even credit card payments for whitelisted contracts.

## Key Features

- **NFT Checkout**: Buy NFTs using either the main currency (e.g., ETH), a swapped currency, or a credit card.
- **Currency Swap**: Swap one token for another before completing the transaction.
- **Fiat Onramp**: Onboard users with fiat currency to interact with the blockchain.

# Installing the module

First install the package:

```bash
npm install @0xsequence/checkout
# or
pnpm install @0xsequence/checkout
# or
yarn add @0xsequence/checkout
```

Then the wallet provider module must placed below the Sequence Web SDK Core provider.

```js
import { SequenceCheckoutProvider } from '@0xsequence/checkout'

const App = () => {
  return (
    <SequenceConnect config={config}>
      <SequenceCheckoutProvider>
        <Page />
      </SequenceCheckoutProvider>
    </SequenceConnect>
  )
}
```
