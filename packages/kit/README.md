<div align="center">
  <img src="https://raw.githubusercontent.com/0xsequence/kit/master/public/docs/kit-logo-in-one.png">
</div>

# Sequence Kit 🧰

Sequence Kit 🧰 is a library enabling developers to easily integrate web3 wallets in their app. It is based on [wagmi](https://wagmi.sh/) and supports all wagmi features.

- Connect via social logins eg: facebook, google, discord, etc...! 🔐🪪
- Connect to popular web3 wallets eg: walletConnect, metamask ! 🦊 ⛓️
- Full-fledged embedded wallet for coins and collectibles 👛 🖼️ 🪙
- Fiat onramp 💵 💶 💴 💷

View the [demo](https://0xsequence.github.io/kit)! 👀

## Quick Start

### Installing the Library

`@0xsequence/kit` is the core package. Any extra modules require this package to be installed first.
To install this package:

```bash
npm install @0xsequence/kit wagmi ethers@5.7.2 viem 0xsequence @tanstack/react-query
# or
pnpm install @0xsequence/kit wagmi ethers@5.7.2 viem 0xsequence @tanstack/react-query
# or
yarn add @0xsequence/kit wagmi ethers@5.7.2 viem 0xsequence @tanstack/react-query
```

### Setting up the Library

React apps must be wrapped by a Wagmi client and the KitWalletProvider components. It is important that the Wagmi wrapper comes before the Sequence Kit wrapper.

```js
import MyPage from './components/MyPage'
import { KitProvider, getDefaultConnectors, getDefaultChains } from '@0xsequence/kit'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createConfig, http, WagmiProvider } from 'wagmi'
import { mainnet, polygon, Chain } from 'wagmi/chains'

const queryClient = new QueryClient()

function App() {
  const chains = getDefaultChains(/* optional array of chain ids to filter */)

  const projectAccessKey = 'xyz'

  const connectors = getDefaultConnectors({
    walletConnectProjectId: 'wallet-connect-id',
    defaultChainId: 137,
    appName: 'demo app',
    projectAccessKey
  })

  const transports = {}

  chains.forEach(chain => {
    transports[chain.id] = http()
  })

  const config = createConfig({
    transports,
    connectors,
    chains
  })

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <KitProvider>
          <MyPage />
        </KitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}
```

### Opening the Sign in Modal

<div align="center">
  <img src="public/docs/sign-in-modal.png">
</div>

Wallet selection is done through a modal which can be called programmatically.

```js
import { useOpenConnectModal } from '@0xsequence/kit'
import { useDisconnect, useAccount } from 'wagmi'

const MyReactComponent = () => {
  const { setOpenConnectModal } = useOpenConnectModal()

  const { isConnected } = useAccount()

  const onClick = () => {
    setOpenConnectModal(true)
  }

  return <>{!isConnected && <button onClick={onClick}>Sign in</button>}</>
}
```

## Hooks

### useOpenConnectModal

Use the `useOpenConnectModal` to change to open or close the connection modal.

```js
import { useOpenConnectModal } from '@0xsequence/kit'
// ...
const { setOpenConnectModal } = useOpenConnectModal()
setOpenConnectModal(true)
```

### useTheme

Use the `useTheme` hook to get information about the current theme, such as light or dark, or set it to something else.

```js
import { useTheme } from '@0xsequence/kit'
const { theme, setTheme } = useTheme()

setTheme('light')
```

## Customization

The `KitProvider` wrapper can accept an optional config object.

The settings are described in more detailed in the Sequence Kit documentation.

```js

  const kitConfig =  {
    defaultTheme: 'light',
    position: 'top-left',
    signIn: {
      logoUrl: 'https://logo-dark-mode.svg',
      projectName: 'my app',
    },
    // limits the digital assets displayed on the assets summary screen
    displayedAssets: [
      {
        contractAddress: ethers.constants.AddressZero,
        chainId: 137,
      },
      {
        contractAddress: '0x631998e91476da5b870d741192fc5cbc55f5a52e',
        chainId: 137
      }
    ],
  }

  <KitProvider config={kitConfig}>
    <App />
  <KitProvider>
```

## Packages

| Package                                                                                       | Description                                                     | Docs                                                                                   |
| --------------------------------------------------------------------------------------------- | --------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| [@0xsequence/kit](https://github.com/0xsequence/kit/tree/master/packages/kit)                 | Core package for Sequence Kit                                   | [Read more](https://github.com/0xsequence/kit/blob/master/packages/kit/README.md)      |
| [@0xsequence/kit-wallet](https://github.com/0xsequence/kit/tree/master/packages/wallet)       | Embedded wallets for viewing and sending coins and collectibles | [Read more](https://github.com/0xsequence/kit/blob/master/packages/wallet/README.md)   |
| [@0xsequence/kit-checkout](https://github.com/0xsequence/kit/tree/master/packages/checkout)   | Checkout modal with fiat onramp                                 | [Read more](https://github.com/0xsequence/kit/blob/master/packages/checkout/README.md) |
| [@0xsequence/kit-example-react](https://github.com/0xsequence/kit/tree/master/examples/react) | Example application showing sign in, wallet and checkout        | [Read more](https://github.com/0xsequence/kit/blob/master/examples/react/README.md)    |

## Local Development

<div align="center">
  <img src="public/docs/kit-demo.png">
</div>

The React example can be used to test the library locally.

1. `pnpm install`
2. From the root folder, run `pnpm build` to build the packages.
3. From the root folder, run `pnpm dev:react` or `pnpm dev:next` to run the examples.

## What to do next?

Now that the core package is installed, you can install the [embedded wallet](https://github.com/0xsequence/kit/tree/master/packages/wallet) or take a look at the [checkout](https://github.com/0xsequence/kit/tree/master/packages/checkout).

## LICENSE

Apache-2.0

Copyright (c) 2017-present Horizon Blockchain Games Inc. / https://horizon.io
