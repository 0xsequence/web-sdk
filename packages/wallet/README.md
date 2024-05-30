# Sequence Kit Wallet

<div align="center">
  <img src="../../public/docs/embedded-wallet.png">
</div>

Embedded wallet allowing to display and send collectibles and coins.

# Installing the module

First install the package:

```bash
npm install @0xsequence/kit-wallet
# or
pnpm install @0xsequence/kit-wallet
# or
yarn add @0xsequence/kit-wallet
```

Then the wallet provider module must placed below the Sequence Kit Core provider.

```js
import { KitWalletProvider } from '@0xsequence/kit-wallet'

const App = () => {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <KitProvider>
          <KitWalletProvider>
            <Page />
          </KitWalletProvider>
        </KitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}
```

# Opening the embedded wallet

The embedded wallet modal can be summoded with the `useOpenWalletModal` hook.

```js
import { useOpenWalletModal } from '@0xsequence/kit-wallet'

const MyComponent = () => {
  const { setOpenWalletModal } = useOpenWalletModal()

  const onClick = () => {
    setOpenWalletModal(true)
  }

  return <button onClick={onClick}>open wallet</button>
}
```
