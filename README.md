Sequence Kit
============

Sequence Kit (@0xsequence/kit) is a library enabling developers to easily integrate web3 wallets in their app. It is based on [wagmi](https://wagmi.sh/) and all functionality from wagmi, such as hooks, can be used.

## Usage
### Installing the Library

`npm install @0xsequence/kit-core wagmi ethers`

or

`pnpm install @0xsequence/kit-core wagmi ethers`

or

`yarn add @0xsequence/kit-core wagmi ethers`

### Installing Wallets
Official wallets can be installed by running:

`npm install @0xsequence/kit-connectors`

or

`pnpm install @0xsequence/kit-connectors`

or

`yarn add @0xsequence/kit-connectors`

### Setting up the Library
React apps must be wrapped by a Wagmi client and the EthConnnectProvider components. It is important that the Wagmi wrapper comes before the Sequence Kit wrapper.

```js
import { SequenceConnectProvider, getSequenceConnectWallets } from '@0xsequence/kit-core'
import { sequenceWallet, metamaskWallet, injectedWallet, walletConnectWallet } from '@0xsequence/kit-connectors'
import { WagmiConfig, createClient, configureChains } from 'wagmi'
import { publicProvider } from 'wagmi/providers/public'
import { mainnet, polygon } from 'wagmi/chains'

import MyPage from './components/MyPage'

function App() {
  const { chains, provider, webSocketProvider } = configureChains(
    [mainnet, polygon],
    [publicProvider()],
  )

  const connectors = getSequenceConnectWallets([
    injectedWallet({
      chains
    }),
    sequenceWallet({
      chains,
      connect: {
        app: 'Sequence Kit example',
        networkId: 137
      }
    }),
    metamaskWallet({
      chains,
    }),
    walletConnectWallet({
      chains,
      options: {
        qrcode: true,
      },
    })
  ])

  
  const client = createClient({
    autoConnect: true,
    provider,
    webSocketProvider,
    connectors
  })


  return (
    <WagmiConfig client={client}>
      <SequenceConnectProvider>
        <MyPage />
      </SequenceConnectProvider>
    </WagmiConfig>
  );
}

```

### Opening the Modal
Wallet selection is done through a modal which can be called programmatically.

```js
import { useOpenConnectModal } from '@0xsequence/kit-core'
import { useDisconnect, useAccount, useSigner, useProvider } from 'wagmi'


const MyReactComponent = () => {
    const openConnectModal = useOpenConnectModal()

      const { isConnected } = useAccount()

    const openTheModal = () => {
      if (openConnectModal) {
        openConnectModal(true)
      }
    }

    return (
      <>
        {!isConnected && (
          <button onClick={openTheModal}>
            Open Modal
          </button>
        )}
      </>
    )
}
```



## Packages

- [@0xsequence/kit-example-react](./examples/react)
- [@0xsequence/kit-core](./packages/core)
- [@0xsequence/kit-connectors](./packages/wallets)


## Local Development
The React example can be used to test the library locally.

1. pnpm install
2. pnpm watch
3. pnpm start:react


## LICENSE

Apache-2.0

Copyright (c) 2017-present Horizon Blockchain Games Inc. / https://horizon.io
