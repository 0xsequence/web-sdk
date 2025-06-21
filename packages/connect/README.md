# Sequence Web SDK 🧰

Sequence Web SDK 🧰 is a library enabling developers to easily integrate web3 wallets in their app. It is based on [wagmi](https://wagmi.sh/) and supports all wagmi features.

- Connect via social logins eg: facebook, google, discord, etc...! 🔐🪪
- Connect to popular web3 wallets eg: walletConnect, metamask ! 🦊 ⛓️
- Full-fledged embedded wallet for coins and collectibles 👛 🖼️ 🪙
- Fiat onramp 💵 💶 💴 💷

View the [demo](https://0xsequence.github.io/web-sdk)! 👀

## Quick Start

### Installing the Library

`@0xsequence/connect` is the core package. Any extra modules require this package to be installed first.
To install this package:

```bash
npm install @0xsequence/connect @0xsequence/hooks wagmi ethers@6.13.0 viem 0xsequence @tanstack/react-query
# or
pnpm install @0xsequence/connect @0xsequence/hooks wagmi ethers@6.13.0 viem 0xsequence @tanstack/react-query
# or
yarn add @0xsequence/connect @0xsequence/hooks wagmi ethers@6.13.0 viem 0xsequence @tanstack/react-query
```

### Setting up the Library

#### The 'easy' way

- `createConfig(walletType, options)` method is used to create your initial config and prepare sensible defaults that can be overridden

`walletType` is either 'waas' or 'universal'

```ts
interface CreateConfigOptions {
  appName: string
  projectAccessKey: string
  chainIds?: number[]
  defaultChainId?: number
  disableAnalytics?: boolean
  defaultTheme?: Theme
  position?: ModalPosition
  customCSS?: string // Injected into shadow dom
  signIn?: {
    logoUrl?: string
    projectName?: string
    useMock?: boolean
  }
  displayedAssets?: Array<{
    contractAddress: string
    chainId: number
  }>
  ethAuth?: EthAuthSettings

  wagmiConfig?: WagmiConfig // optional wagmiConfig overrides

  waasConfigKey: string
  enableConfirmationModal?: boolean

  walletConnect?:
    | boolean
    | {
        projectId: string
      }

  guest?: boolean

  google?:
    | boolean
    | {
        clientId: string
      }

  apple?:
    | boolean
    | {
        clientId: string
        rediretURI: string
      }

  email?:
    | boolean
    | {
        legacyEmailAuth?: boolean
      }
}
```

```js
import { SequenceConnect, createConfig } from '@0xsequence/connect'

import Content from './components/Content'

const config = createConfig('waas', {
  projectAccessKey: '<your-project-access-key>',
  chainIds: [1, 137],
  defaultChainId: 1,
  appName: 'Demo Dapp',
  waasConfigKey: '<your-waas-config-key>',

  guest: true,

  google: {
    clientId: '<your-google-client-id>'
  },

  apple: {
    clientId: '<your-apple-client-id>',
    redirectUrl: '...'
  },

  walletConnect: {
    projectId: '<your-wallet-connect-id>'
  },

  email: true
})

function App() {
  return (
    <SequenceConnect config={config}>
      <Content />
    </SequenceConnect>
  )
}
```

#### Need more customization?

React apps must be wrapped by a Wagmi client and the SequenceWalletProvider components. It is important that the Wagmi wrapper comes before the Sequence Web SDK wrapper.

```js
import Content from './components/Content'
import { SequenceConnectProvider, getDefaultConnectors, getDefaultChains } from '@0xsequence/connect'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createConfig, http, WagmiProvider } from 'wagmi'
import { mainnet, polygon, Chain } from 'wagmi/chains'

const projectAccessKey = 'xyz'

const chains = getDefaultChains(/* optional array of chain ids to filter */)

const transports = {}

chains.forEach(chain => {
  transports[chain.id] = http()
})

const connectors = getDefaultConnectors('universal', {
  projectAccessKey,
  appName: 'demo app',
  defaultChainId: 137,

  walletConnect: {
    projectId: '<your-wallet-connect-project-id>'
  }
})

const config = createConfig({
  chains,
  transports,
  connectors
})

const queryClient = new QueryClient()

function App() {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <SequenceConnectProvider>
          <Content />
        </SequenceConnectProvider>
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
import { useOpenConnectModal } from '@0xsequence/connect'
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
import { useOpenConnectModal } from '@0xsequence/connect'
// ...
const { setOpenConnectModal } = useOpenConnectModal()
setOpenConnectModal(true)
```

### useTheme

Use the `useTheme` hook to get information about the current theme, such as light or dark, or set it to something else.

```js
import { useTheme } from '@0xsequence/connect'
const { theme, setTheme } = useTheme()

setTheme('light')
```

## Customization

The `SequenceConnectProvider` wrapper can accept an optional config object.

The settings are described in more detailed in the Sequence Web SDK documentation.

```js

  const connectConfig =  {
    defaultTheme: 'light',
    position: 'top-left',
    signIn: {
      logoUrl: 'https://logo-dark-mode.svg',
      projectName: 'my app',
    },
    // limits the digital assets displayed on the assets summary screen
    displayedAssets: [
      {
        contractAddress: zeroAddress,
        chainId: 137,
      },
      {
        contractAddress: '0x631998e91476da5b870d741192fc5cbc55f5a52e',
        chainId: 137
      }
    ],
    readOnlyNetworks: [10],
  }

  <SequenceConnectProvider config={connectConfig}>
    <App />
  <SequenceConnectProvider>
```

## Packages

| Package                                                                                               | Description                                                     | Docs                                                                                            |
| ----------------------------------------------------------------------------------------------------- | --------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| [@0xsequence/connect](https://github.com/0xsequence/web-sdk/tree/master/packages/connect)             | Core package for Sequence Web SDK                               | [Read more](https://github.com/0xsequence/web-sdk/blob/master/packages/connect/README.md)       |
| [@0xsequence/wallet-widget](https://github.com/0xsequence/web-sdk/tree/master/packages/wallet-widget) | Embedded wallets for viewing and sending coins and collectibles | [Read more](https://github.com/0xsequence/web-sdk/blob/master/packages/wallet-widget/README.md) |
| [@0xsequence/checkout](https://github.com/0xsequence/web-sdk/tree/master/packages/checkout)           | Checkout modal with fiat onramp                                 | [Read more](https://github.com/0xsequence/web-sdk/blob/master/packages/checkout/README.md)      |
| [example-react](https://github.com/0xsequence/web-sdk/tree/master/examples/react)                     | Example application showing sign in, wallet and checkout        | [Read more](https://github.com/0xsequence/web-sdk/blob/master/examples/react/README.md)         |

## Local Development

<div align="center">
  <img src="public/docs/web-sdk-demo.png">
</div>

The React example can be used to test the library locally.

1. `pnpm install`
2. From the root folder, run `pnpm build` to build the packages.
3. From the root folder, run `pnpm dev:react` or `pnpm dev:next` to run the examples.

## What to do next?

Now that the core package is installed, you can install the [embedded wallet](https://github.com/0xsequence/web-sdk/tree/master/packages/wallet-widget) or take a look at the [checkout](https://github.com/0xsequence/web-sdk/tree/master/packages/checkout).

## LICENSE

Apache-2.0

Copyright (c) 2017-present Horizon Blockchain Games Inc. / https://horizon.io
