<div align="center">
  <img src="https://raw.githubusercontent.com/0xsequence/kit/master/public/docs/kit-logo-in-one.png">
</div>

# Sequence Kit 🧰

[![npm version](https://badge.fury.io/js/@0xsequence%2Fkit.svg)](https://badge.fury.io/js/@0xsequence%2Fkit)

Easily integrate web3 wallets in your app with Sequence Kit 🧰. Based on [wagmi](https://wagmi.sh/), and supporting all wagmi features.

- Connect via social logins eg: facebook, google, discord, etc...! 🔐🪪
- Connect to popular web3 wallets eg: walletConnect, metamask ! 🦊 ⛓️
- Full-fledged embedded wallet for coins and collectibles 👛 🖼️ 🪙

View the [demo](https://0xsequence.github.io/kit)! 👀

## Quick Start

### Installing the Library

`@0xsequence/kit` is the core package. Any extra modules require this package to be installed first.
To install this package:

```bash
npm install @0xsequence/kit wagmi ethers@6.13.0 viem 0xsequence @tanstack/react-query
# or
pnpm install @0xsequence/kit wagmi ethers@6.13.0 viem 0xsequence @tanstack/react-query
# or
yarn add @0xsequence/kit wagmi ethers@6.13.0 viem 0xsequence @tanstack/react-query
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
  signIn?: {
    logoUrl?: string
    projectName?: string
    useMock?: boolean
  }
  /**
   * @deprecated Use `displayedChainIds` and `displayedContracts` instead.
   * if deprecated `displayedAssets` are provided as well as `displayedChainIds` and `displayedContracts`,
   * `displayedChainIds` and `displayedContracts` will take precedence and 'displayedAssets' will be ignored
   */
  displayedAssets?: Array<{
    contractAddress: string
    chainId: number
  }>
  displayedChainIds?: number[]
  displayedContracts?: string[]
  ethAuth?: EthAuthSettings

  wagmiConfig?: WagmiConfig // optional wagmiConfig overrides

  waasConfigKey?: string
  enableConfirmationModal?: boolean

  walletConnect?:
    | false
    | {
        projectId: string
      }

  google?:
    | false
    | {
        clientId: string
      }

  apple?:
    | false
    | {
        clientId: string
        redirectURI: string
      }

  email?:
    | boolean
    | {
        legacyEmailAuth?: boolean
      }
}
```

```js
import { SequenceKit, createConfig } from '@0xsequence/kit'

import Content from './components/Content'

const config = createConfig('waas', {
  projectAccessKey: '<your-project-access-key>',
  chainIds: [1, 137]
  defaultChainId: 1
  appName: 'Demo Dapp',
  waasConfigKey: '<your-waas-config-key>',

  google: {
    clientId: '<your-google-client-id>'
  },

  apple: {
    clientId: '<your-apple-client-id>',
    redirectUrl: '...'
  },

  walletConnect: {
    projectId: '<your-wallet-connect-id>'
  }
})

function App() {
  return (
    <SequenceKit config={config}>
      <Content />
    </SequenceKit>
  )
}
```

#### Need more customization?

React apps must be wrapped by a WagmiProvider and the KitProvider components. It is important that the Wagmi wrapper comes before the Sequence Kit wrapper.

```js
import '@0xsequence/kit/styles.css'

import Content from './components/Content'
import { KitProvider, getDefaultConnectors, getDefaultChains } from '@0xsequence/kit'
import { KitWalletProvider } from '@0xsequence/kit-wallet'
import { KitCheckoutProvider } from '@0xsequence/kit-checkout'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createConfig, http, WagmiProvider } from 'wagmi'
import { mainnet, polygon, Chain } from 'wagmi/chains'

const projectAccessKey = '<your-project-access-key>'

const chains = getDefaultChains(/* optional array of chain ids to filter */)

const transports = {}

chains.forEach(chain => {
  transports[chain.id] = http()
})

// Universal wallet configuration
const connectors = getDefaultConnectors('universal', {
  projectAccessKey,
  appName: 'Demo Dapp',
  defaultChainId: 137,

  walletConnect: {
    projectId: '<your-wallet-connect-id>'
  }
})

/* 
  const connectors = getDefaultWaasConnectors('{
    projectAccessKey,
    defaultChainId: 137,
    appName: 'Demo Dapp',

    waasConfigKey: '<your-waas-config-key>',
    
    google: {
      clientId
    },

    apple: {
      clientId,
      redirectUrl
    },

    walletConnect: {
      projectId: '<your-wallet-connect-id>'
    }
  })
  */

const wagmiConfig = createConfig({
  chains,
  transports,
  connectors
})

const kitConfig = {
  projectAccessKey: '...'
}

const queryClient = new QueryClient()

function App() {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <KitProvider config={kitConfig}>
          {/* If you want to use wallet modal to show assets etc. */}
          <KitWalletProvider>
            {/* If you want to use checkout functionalities */}
            <KitCheckoutProvider>
              <Content />
            </KitCheckoutProvider>
          </KitWalletProvider>
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

Wallet selection is done through a modal which can be called programmatically. Kit allows multiple connection, so it can be called again to connect more wallets.

```js
import { useOpenConnectModal } from '@0xsequence/kit'
import { useDisconnect, useAccount } from 'wagmi'

const MyReactComponent = () => {
  const { setOpenConnectModal } = useOpenConnectModal()

  const { wallets } = useKitWallets()

  const onClick = () => {
    setOpenConnectModal(true)
  }

  return <>{!wallets.length && <button onClick={onClick}>Sign in</button>}</>
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

### useKitWallets

Use the `useKitWallets` hook to manage multiple connected wallets in your application and see linked wallets of the connected embedded wallet. This hook is particularly useful when working with a combination of embedded and external wallets.

```js
import { useKitWallets } from '@0xsequence/kit'

const {
  wallets, // Array of connected wallets
  linkedWallets, // Array of linked wallets (for embedded wallets)
  setActiveWallet, // Function to set a wallet as active
  disconnectWallet // Function to disconnect a wallet
} = useKitWallets()

/**
 * Interface representing a connected wallet
 */
interface KitWallet {
  /** Unique identifier */
  id: string
  /** Display name of the wallet */
  name: string
  /** Wallet address */
  address: string
  /** Whether this is the currently active wallet */
  isActive: boolean
  /** Whether this is an embedded wallet */
  isEmbedded: boolean
}

// Switch to a different connected wallet
await setActiveWallet(walletAddress)

// Disconnect a specific wallet
await disconnectWallet(walletAddress)
```

### useTheme

Use the `useTheme` hook to get information about the current theme, such as light or dark.

```js
import { useTheme } from '@0xsequence/kit'
const { theme, setTheme } = useTheme()

setTheme('light')
```

## Customization

The `KitProvider` wrapper can accept an optional config object.

The settings are described in more detailed in the Sequence Kit documentation.

```js

  const kitConfig = {
    defaultTheme: 'light',
    position: 'top-left',
    signIn: {
      logoUrl: 'https://logo-dark-mode.svg',
      projectName: 'my app',
    };
    // limits the digital assets displayed on the assets summary screen
    displayedChainIds: [137],
    displayedContracts: [
      ethers.ZeroAddress,
      '0x631998e91476da5b870d741192fc5cbc55f5a52e'
    ],
    readOnlyNetworks: [10], // Display assets in wallet (kit/wallet) from Optimism (chain ID 10) in addition to the networks specified in chainIds
  }

  <KitProvider config={kitConfig}>
    <App />
  <KitProvider>
```

## Packages

| Package                                                                                     | Description                                                     | Docs                                                                                   |
| ------------------------------------------------------------------------------------------- | --------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| [@0xsequence/kit](https://github.com/0xsequence/kit/tree/master/packages/kit)               | Core package for Sequence Kit                                   | [Read more](https://github.com/0xsequence/kit/blob/master/packages/kit/README.md)      |
| [@0xsequence/kit-wallet](https://github.com/0xsequence/kit/tree/master/packages/wallet)     | Embedded wallets for viewing and sending coins and collectibles | [Read more](https://github.com/0xsequence/kit/blob/master/packages/wallet/README.md)   |
| [@0xsequence/kit-checkout](https://github.com/0xsequence/kit/tree/master/packages/checkout) | Checkout modal with fiat onramp                                 | [Read more](https://github.com/0xsequence/kit/blob/master/packages/checkout/README.md) |

## Examples

| Application                                                                                   | Description                                                            | Docs                                                                                |
| --------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| [@0xsequence/kit-example-react](https://github.com/0xsequence/kit/tree/master/examples/react) | React example application showing sign in, wallet and checkout         | [Read more](https://github.com/0xsequence/kit/blob/master/examples/react/README.md) |
| [@0xsequence/kit-example-next](https://github.com/0xsequence/kit/tree/master/examples/next)   | Next example application showing sign in, wallet and checkout with SSR | [Read more](https://github.com/0xsequence/kit/blob/master/examples/next/README.md)  |

## Local Development

<div align="center">
  <img src="public/docs/kit-demo.png">
</div>

The React example can be used to test the library locally.

1. Replace the kit dependencies to the ones of the workspace in order to use hot reload.:

```js
"@0xsequence/kit": "workspace:*",
"@0xsequence/kit-checkout": "workspace:*",
"@0xsequence/kit-wallet": "workspace:*",
```

2. `pnpm install`
3. From the root folder, run `pnpm build` to build the packages OR optionally run `pnpm dev` in a separate terminal to develop in watch mode.
4. From the root folder, run `pnpm dev:react` or `pnpm dev:next` to run the examples. If you want to run the examples in debug mode, run `pnpm debug:react`

## What to do next?

Now that the core package is installed, you can install the [embedded wallet](https://github.com/0xsequence/kit/tree/master/packages/wallet) or take a look at the [checkout](https://github.com/0xsequence/kit/tree/master/packages/checkout).

## LICENSE

Apache-2.0

Copyright (c) 2017-present Horizon Blockchain Games Inc. / https://horizon.io
