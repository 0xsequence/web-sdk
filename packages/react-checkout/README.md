# Sequence Web SDK Checkout

Sequence Checkout provides a seamless and flexible payment experience for interacting with NFTs, cryptocurrencies, and fiat currencies. It supports multiple payment options, including cryptocurrency transfers, currency swaps, and even credit card payments for whitelisted contracts.

## Key Features

- **NFT Checkout**: Buy NFTs using either the main currency (e.g., ETH), a swapped currency, or a credit card.
- **Currency Swap**: Swap one token for another before completing the transaction.
- **Fiat Onramp**: Onboard users with fiat currency to interact with the blockchain.

# Installing the module

First install the package:

```bash
npm install @0xsequence/react-checkout
# or
pnpm install @0xsequence/react-checkout
# or
yarn add @0xsequence/react-checkout
```

Then the wallet provider module must placed below the Sequence Web SDK Core provider.

```js
import { SequenceCheckoutProvider } from '@0xsequence/react-checkout'

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

# NFT Checkout (Sequence Pay)

<div align="center">
  <img src="../../public/docs/checkout-modal.png">
</div>

Sequence Pay Checkout allows users to purchase NFTs using various payment methods. Users can pay with the main currency (e.g., ETH), swap tokens for payment, or use a credit card provided the smart contract is whitelisted (contact a member of the Sequence team to whitelist your contract for credit card payments).

## Basic Usage

To enable this functionality in your app, use the `useSelectPaymentModal` hook from the `@0xsequence/react-checkout` package. The following code demonstrates how to set up the checkout modal and trigger it on a button click:

```js
import { useSelectPaymentModal, type SelectPaymentSettings } from '@0xsequence/react-checkout'

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

    const settings: SelectPaymentSettings = {
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

## Parameters

- **collectibles**: List of NFT collectibles, including their token IDs and quantities.
- **chain**: The blockchain network ID.
- **price**: Total price for the transaction in the selected currency. This value should not contain decimals.
- **currencyAddress**: The address of the currency used for executing the transaction on the target contract.
- **targetContractAddress**: The address of the smart contract handling the minting function.
  creditCardProviders: Providers like sardine for credit card payments.
- **collectionAddress**: The contract address of the collectible such as an ERC-1155 or ERC-721
- **creditCardProviders**: The list of credit card providers to execute a payment with. It is up to the developer to make sure that the region, currency and network is compatible.
- **txData**: Encoded transaction data to interact with the mint function.
- **copyrightText**: The copyright text shown at the bottom of the modal.
- **onSuccess**: Callback function triggered once the transaction has been confirmed on the blockchain.
- **blockConfirmations**: The number of block confirmations required for the transaction to be considered successful and trigger `onSuccess`.
- **onError**: Callback function triggered if an error has occurred before or after sending the transaction.

## Utility functions

The `@0xsequence/react-checkout` library indeed simplifies the integration of Web3 payment solutions by providing utility functions. One such function, `useERC1155SaleContractPaymentModal`, is tailored for use cases involving the minting of ERC-1155 tokens. This function works in conjunction with Sequence's wallet ecosystem and its deployable smart contract infrastructure, such as the ERC-1155 sale contract available through the [Sequence Builder](https://sequence.build).

```js
import { useERC1155SaleContractCheckout } from "@0xsequence/react-checkout";
import { useAccount } from "wagmi";

const MyComponent = () => {
  const { address: userAddress } = useAccount();
  const { openCheckoutModal } = useERC1155SaleContractCheckout({
    chain: 80001, // chainId of the chain the collectible is on
    contractAddress: "0x0327b2f274e04d292e74a06809bcd687c63a4ba4", // address of the contract handling the minting function
    wallet: userAddress!, // address of the recipient
    collectionAddress: "0x888a322db4b8033bac3ff84412738c096f87f9d0", // address of the collection contract
    items: [
      // array of collectibles to purchase
      {
        tokenId: "0",
        quantity: "1",
      },
    ],
    onSuccess: (txnHash: string) => {
      console.log("success!", txnHash);
    },
    onError: (error: Error) => {
      console.error(error);
    },
  });

  const onClick = () => {
    if (!userAddress) {
      return;
    }
    openCheckoutModal();
  };

  return <button onClick={onClick}>Buy ERC-1155 collectible!</button>;
};
```

# Swap

<div align="center">
  <img src="../../public/docs/swap-modal.png">
</div>

The **Swap Modal** allows users to swap one currency for another (e.g., ETH to USDC) before completing a transaction. This feature is useful when users need to convert their tokens into the correct currency for payment.

## Basic Usage

Here’s an example of how to use the Swap Modal with the `useSwapModal` hook:

```js
import { useSwapModal, type SwapModalSettings } from '@0xsequence/react-checkout'

const MyComponent = () => {
  const { openSwapModal } = useSwapModal()

  const onClick = () => {
    const chainId = 137
    const currencyAddress = '0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359'
    const currencyAmount = '20000'
    const data = encodeFunctionData({ abi: parseAbi(['function demo()']), functionName: 'demo', args: []})

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
import { useAddFundsModal } from '@0xsequence/react-checkout'

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
