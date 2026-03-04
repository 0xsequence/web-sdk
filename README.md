# Sequence Web SDKs

A comprehensive toolkit of Web3 SDKs that seamlessly integrate into your application.

We provide your users with a smooth and secure onboarding experience. With our robust tools built on the popular wagmi library, unlock a realm of possibilities in the world of web3.

## 📦 Our Toolkit

- **[@0xsequence/connect](https://www.npmjs.com/package/@0xsequence/connect/v/0.0.0-20250924112110)** - Connect and authentication
- **[@0xsequence/checkout](https://www.npmjs.com/package/@0xsequence/checkout/v/0.0.0-20250924112110)** - Payment and checkout flows
- **[@0xsequence/hooks](https://www.npmjs.com/package/@0xsequence/hooks/v/0.0.0-20250924112110)** - React hooks for Web3 functionality
- **[@0xsequence/wallet-widget](https://www.npmjs.com/package/@0xsequence/wallet-widget/v/0.0.0-20250924112110)** - Production-ready wallet widget
- **[@0xsequence/marketplace-sdk](https://www.npmjs.com/package/@0xsequence/marketplace-sdk)** - Marketplace UI and functionality

## ✨ Key Features

### 🔐 Seamless Authentication
Connect via popular social logins such as Google, Apple, Facebook or use email, passkeys or any external wallet!

### 🏦 Ecosystem Wallet
A cross-application and self-custodial smart contract wallet that users can create to interact with any application on the Ecosystem.

### ⚡ Smart Sessions
Allow users to pre-approve a set of granular permissions, enabling a fluid experience or powerful automation, all while maintaining user security and self-custody.

### 🔄 Swap Hooks
Easily plug in our swap hooks to your application to enable token swaps.

### 🔗 Link Wallets
Allow your users to link multiple wallets to their account.

### 🌐 Chain Abstraction
Build a chain abstracted experience by using our hooks to fetch multi-chain balances, coin prices, transactions and more.

### 💼 Web3 Inventory
Provide your users with a web3-enabled inventory, enabling them to manage their coins and collectibles all within your own application.

### 🎨 NFT Checkout
Enable users to purchase collectibles within Sequence Checkout using a credit card or crypto.

### 🎛️ Wallet Widget
A production ready wallet widget with built-in swap, transaction history, inventory, fiat onramp and more.

### 🎨 Customizability
Brand the connect modal with your own logo, color scheme and configure it with your social providers and wallets you want to service.

### 🛒 Marketplace UI & Hooks
Easiest way to build your own Web3 Marketplace without managing infrastructure.

## 🚀 Get Started

Explore the potential of our Web SDKs by trying out our [demo](https://web-sdk.sequence-demos.xyz/)!

### Quick Start

Install the core package and required peer deps:

```bash
npm install @0xsequence/connect @0xsequence/hooks wagmi ethers@6.13.0 viem @tanstack/react-query
```

### Configure `@0xsequence/connect`

The SDK supports two connector paths. Keep them separate in your app config so behavior is explicit.

#### 1. Ecosystem Connector (`sequenceV3Connector` / `sequenceV3Wallet`)

Use `createConfig({...})` (without wallet type) to configure the v3 path.

```ts
import { createConfig } from '@0xsequence/connect'

export const ecosystemConfig = createConfig({
  projectAccessKey: '<your-project-access-key>',
  appName: 'Demo Dapp',
  signIn: {
    projectName: 'Demo Dapp'
  },
  chainIds: [1, 137],
  defaultChainId: 1,

  // required for v3 social/email/passkey connectors
  walletUrl: 'https://wallet.sequence.app',
  dappOrigin: window.location.origin,

  // v3 auth connectors
  email: true,
  google: true,
  apple: true,
  passkey: true,

  // external wallets
  walletConnect: {
    projectId: '<your-wallet-connect-id>'
  },
  metaMask: true,
  coinbase: true
})
```

#### 2. WaaS Connector

Use `createConfig('waas', {...})` when authenticating with WaaS.

```ts
import { createConfig } from '@0xsequence/connect'

export const waasConfig = createConfig('waas', {
  projectAccessKey: '<your-project-access-key>',
  waasConfigKey: '<your-waas-config-key>',
  appName: 'Demo Dapp',
  chainIds: [1, 137],
  defaultChainId: 1,

  guest: true,
  email: true,
  google: {
    clientId: '<your-google-client-id>'
  },
  apple: {
    clientId: '<your-apple-client-id>',
    redirectURI: 'https://your.app/apple-callback'
  },
  X: {
    clientId: '<your-x-client-id>',
    redirectURI: 'https://your.app/x-callback'
  },

  walletConnect: {
    projectId: '<your-wallet-connect-id>'
  }
})
```

#### Note about X (formerly Twitter) auth

X auth needs a callback route. Your configured `redirectURI` must match the route exactly.

```tsx
import { useEffect } from 'react'

export function XAuthCallback() {
  useEffect(() => {
    const query = new URLSearchParams(window.location.search)

    const payload = {
      code: query.get('code'),
      state: query.get('state')
    }

    if (window.opener) {
      window.opener.postMessage({ type: 'OAUTH_RETURN', data: payload }, '*')
    }

    window.close()
  }, [])

  return <h3>You may now close this window.</h3>
}
```

### Wrap your app

```tsx
import { SequenceConnect } from '@0xsequence/connect'
import { waasConfig } from './config'
import Content from './Content'

export function App() {
  return (
    <SequenceConnect config={waasConfig}>
      <Content />
    </SequenceConnect>
  )
}
```

### Opening the Sign in Modal

<div align="center">
  <img src="public/docs/sign-in-modal.png">
</div>

```tsx
import { useOpenConnectModal } from '@0xsequence/connect'
import { useConnection } from 'wagmi'

export function SignInButton() {
  const { setOpenConnectModal } = useOpenConnectModal()
  const { isConnected } = useConnection()

  if (isConnected) return null

  return <button onClick={() => setOpenConnectModal(true)}>Sign in</button>
}
```

## Hooks

### `useOpenConnectModal`

```ts
import { useOpenConnectModal } from '@0xsequence/connect'

const { setOpenConnectModal } = useOpenConnectModal()
setOpenConnectModal(true)
```

### `useWallets`

```ts
import { useWallets } from '@0xsequence/connect'

const {
  wallets,
  linkedWallets,
  setActiveWallet,
  disconnectWallet,
  refetchLinkedWallets
} = useWallets()

await setActiveWallet('<wallet-address>')
await disconnectWallet('<wallet-address>')
await refetchLinkedWallets()
```

### `useTheme`

```ts
import { useTheme } from '@0xsequence/connect'

const { theme, setTheme } = useTheme()
setTheme('light')
```

## Customization

All UI options can be configured directly in `createConfig`.

```ts
import { createConfig } from '@0xsequence/connect'
import { zeroAddress } from 'viem'

const config = createConfig('waas', {
  projectAccessKey: '<your-project-access-key>',
  waasConfigKey: '<your-waas-config-key>',
  appName: 'Demo Dapp',
  defaultTheme: 'light',
  position: 'top-left',
  signIn: {
    logoUrl: 'https://your-cdn/logo.svg',
    projectName: 'My App'
  },
  displayedAssets: [
    {
      contractAddress: zeroAddress,
      chainId: 137
    }
  ],
  readOnlyNetworks: [10],
  onConnectSuccess: address => {
    console.log('Wallet connected:', address)
  }
})
```

## Packages

| Package                                                                                               | Description                                                     | Docs                                                                                            |
| ----------------------------------------------------------------------------------------------------- | --------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| [@0xsequence/connect](https://github.com/0xsequence/web-sdk/tree/master/packages/connect)             | Core package for Sequence Web SDK                               | [Read more](https://github.com/0xsequence/web-sdk/blob/master/packages/connect/README.md)       |
| [@0xsequence/wallet-widget](https://github.com/0xsequence/web-sdk/tree/master/packages/wallet-widget) | Embedded wallets for viewing and sending coins and collectibles | [Read more](https://github.com/0xsequence/web-sdk/blob/master/packages/wallet-widget/README.md) |
| [@0xsequence/checkout](https://github.com/0xsequence/web-sdk/tree/master/packages/checkout)           | Checkout modal with fiat onramp                                 | [Read more](https://github.com/0xsequence/web-sdk/blob/master/packages/checkout/README.md)      |

## Examples

| Application                                                                       | Description                                                            | Docs                                                                                    |
| --------------------------------------------------------------------------------- | ---------------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| [example-react](https://github.com/0xsequence/web-sdk/tree/master/examples/react) | React example application showing sign in, wallet and checkout         | [Read more](https://github.com/0xsequence/web-sdk/blob/master/examples/react/README.md) |
| [example-next](https://github.com/0xsequence/web-sdk/tree/master/examples/next)   | Next example application showing sign in, wallet and checkout with SSR | [Read more](https://github.com/0xsequence/web-sdk/blob/master/examples/next/README.md)  |

## Local Development

<div align="center">
  <img src="public/docs/web-sdk-demo.png">
</div>

The React example can be used to test the library locally.

1. Replace web-sdk dependencies with workspace versions:

```json
"@0xsequence/connect": "workspace:*",
"@0xsequence/checkout": "workspace:*",
"@0xsequence/wallet-widget": "workspace:*"
```

2. `pnpm install`
3. From the root folder, run `pnpm build` to build packages, or run `pnpm dev` in a separate terminal for watch mode.
4. From the root folder, run `pnpm dev:react` or `pnpm dev:next` to run the examples.

## What to do next?

Now that the core package is installed, you can install the [embedded wallet](https://github.com/0xsequence/web-sdk/tree/master/packages/wallet-widget) or take a look at the [checkout](https://github.com/0xsequence/web-sdk/tree/master/packages/checkout).

## LICENSE

Apache-2.0

Copyright (c) 2017-present Sequence Platforms ULC. / https://sequence.xyz
