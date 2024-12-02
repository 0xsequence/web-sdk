# Sequence Kit Checkout

Sequence Checkout provides a seamless and flexible payment experience for interacting with NFTs, cryptocurrencies, and fiat currencies. It supports multiple payment options, including cryptocurrency transfers, currency swaps, and even credit card payments for whitelisted contracts.

## Key Features

- **NFT Checkout**: Buy NFTs using either the main currency (e.g., ETH), a swapped currency, or a credit card.
- **Currency Swap**: Swap one token for another before completing the transaction.
- **Fiat Onramp**: Onboard users with fiat currency to interact with the blockchain.

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

# NFT Checkout (Sequence Pay)

<div align="center">
  <img src="../../public/docs/checkout-modal.png">
</div>

Sequence Pay Checkout allows users to purchase NFTs using various payment methods. Users can pay with the main currency (e.g., ETH), swap tokens for payment, or use a credit card provided the smart contract is whitelisted (contact a member of the Sequence team to whitelist your contract for credit card payments).

## Basic Usage

To enable this functionality in your app, use the `useSelectPaymentModal` hook from the `@0xsequence/kit-checkout` package. The following code demonstrates how to set up the checkout modal and trigger it on a button click:

```js
import { useSelectPaymentModal, type SelectPaymentSettings } from '@0xsequence/kit-checkout'

const MyComponent = () => {
  const { openSelectPaymentModal } = useSelectPaymentModal()

  const onClick = () => {
    const erc1155SalesContractAbi = [
      {
        type: 'function',
        name: 'mint',
        inputs: [
          { name: 'to', type: 'address', internalType: 'address' },
          { name: 'tokenIds', type: 'uint256[]', internalType: 'uint256[]' },
          { name: 'amounts', type: 'uint256[]', internalType: 'uint256[]' },
          { name: 'data', type: 'bytes', internalType: 'bytes' },
          { name: 'expectedPaymentToken', type: 'address', internalType: 'address' },
          { name: 'maxTotal', type: 'uint256', internalType: 'uint256' },
          { name: 'proof', type: 'bytes32[]', internalType: 'bytes32[]' }
        ],
        outputs: [],
        stateMutability: 'payable'
      }
    ]

    const purchaseTransactionData = encodeFunctionData({
      abi: erc1155SalesContractAbi,
      functionName: 'mint',
      args: [
        recipientAddress,
        collectibles.map(c => BigInt(c.tokenId)),
        collectibles.map(c => BigInt(c.quantity)),
        toHex(0),
        currencyAddress,
        price,
        [toHex(0, { size: 32 })]
      ]
    })

    const settings = {
      collectibles: [
        {
          tokenId: '1',
          quantity: '1'
        }
      ],
      chain: chainId,
      price,
      targetContractAddress: salesContractAddress,
      recipientAddress: address,
      currencyAddress,
      collectionAddress,
      creditCardProviders: ['sardine'],
      copyrightText: 'ⓒ2024 Sequence',
      onSuccess: (txnHash: string) => {
        console.log('success!', txnHash)
      },
      onError: (error: Error) => {
        console.error(error)
      },
      txData: purchaseTransactionData,
    }

    openSelectPaymentModal(settings)
  }

  return <button onClick={onClick}>Purchase collectible</button>
}
```

## Key Parameters

- **collectibles**: List of NFT collectibles, including their token IDs and quantities.
- **chain**: The blockchain network ID.
- **price**: Total price for the transaction in the selected currency.
- **targetContractAddress**: The address of the smart contract handling the minting function.
  creditCardProviders: Providers like sardine for credit card payments.
- **txData**: Encoded transaction data to interact with the mint function.

## Utility functions

The `@0xsequence/kit-checkout` library indeed simplifies the integration of Web3 payment solutions by providing utility functions. One such function, `useERC1155SaleContractPaymentModal`, is tailored for use cases involving the minting of ERC-1155 tokens. This function works in conjunction with Sequence's wallet ecosystem and its deployable smart contract infrastructure, such as the ERC-1155 sale contract available through the [Sequence Builder](https://sequence.build).

```js
import { useERC1155SaleContractPaymentModal } from '@0xsequence/kit-checkout'

const MyComponent = () => {
  const { openERC1155SaleContractPaymentModal } = useERC1155SaleContractPaymentModal()


  const onClick = () => {
    if (!address) {
      return
    }
    // // ERC-20 contract
    const currencyAddress = '0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359'
    const salesContractAddress = '0xe65b75eb7c58ffc0bf0e671d64d0e1c6cd0d3e5b'
    const collectionAddress = '0xdeb398f41ccd290ee5114df7e498cf04fac916cb'
    const price = '20000'

    const chainId = 137

    openERC1155SaleContractPaymentModal({
      collectibles: [
        {
          tokenId: '1',
          quantity: '1'
        }
      ],
      chain: chainId,
      price,
      targetContractAddress: salesContractAddress,
      recipientAddress: address,
      currencyAddress,
      collectionAddress,
      creditCardProviders: ['sardine'],
      isDev: true,
      copyrightText: 'ⓒ2024 Sequence',
      onSuccess: (txnHash: string) => {
        console.log('success!', txnHash)
      },
      onError: (error: Error) => {
        console.error(error)
      }
    })
  }

  return <button onClick={onClick}>Buy ERC-1155 collectble!</button>
}
```

# Swap

<div align="center">
  <img src="../../public/docs/swap-modal.png">
</div>

The **Swap Modal** allows users to swap one currency for another (e.g., ETH to USDC) before completing a transaction. This feature is useful when users need to convert their tokens into the correct currency for payment.

## Basic Usage

Here’s an example of how to use the Swap Modal with the `useSwapModal` hook:

```js
import { useSwapModal, type SwapModalSettings } from '@0xsequence/kit-checkout'

const MyComponent = () => {
  const { openSwapModal } = useSwapModal()

  const onClick = () => {
    const chainId = 137
    const currencyAddress = '0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359'
    const currencyAmount = '20000'

    const contractAbiInterface = new ethers.Interface(['function demo()'])

    const data = contractAbiInterface.encodeFunctionData('demo', []) as `0x${string}`

    const swapModalSettings: SwapModalSettings = {
      onSuccess: () => {
        console.log('swap successful!')
      },
      chainId,
      currencyAddress,
      currencyAmount,
      postSwapTransactions: [
        {
          to: '0x37470dac8a0255141745906c972e414b1409b470',
          data
        }
      ],
      title: 'Swap and Pay',
      description: 'Select a token in your wallet to swap to 0.2 USDC.'
    }

    openSwapModal(swapModalSettings)
  }

  return <button onClick={onClick}>Swap and Pay</button>
}
```

## Key Parameters

- **currencyAddress**: The address of the token to swap from (e.g., USDC).
- **currencyAmount**: The amount to swap.
- **postSwapTransactions**: An optional array of transactions to be executed after the swap, using the swapped tokens.
- **title**: The modal’s title.
- **description**: A description of the swap and payment process.

# Fiat Onramp

<div align="center">
  <img src="../../public/docs/fiat-onramp.png">
</div>

The Fiat Onramp feature allows users to convert traditional fiat currencies (e.g., USD) into cryptocurrencies. This feature makes it easier for non-crypto users to interact with decentralized applications (dApps) by onboarding them directly through fiat payments.

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
