# Sequence Web SDK Wallet

<div align="center">
  <img src="../../public/docs/embedded-wallet.png">
</div>

Embedded wallet allowing to display and send collectibles and coins.

# Installing the module

First install the package:

```bash
npm install @0xsequence/wallet-widget
# or
pnpm install @0xsequence/wallet-widget
# or
yarn add @0xsequence/wallet-widget
```

Then the wallet provider module must placed below the Sequence Web SDK Core provider.

```js
import { SequenceWalletProvider } from '@0xsequence/wallet-widget'

const App = () => {
  return (
    <SequenceConnect config={config}>
      <SequenceWalletProvider>
        <Page />
      </SequenceWalletProvider>
    </WagmiProvider>
  )
}
```

# Opening the embedded wallet

The embedded wallet modal can be summoded with the `useOpenWalletModal` hook.

```js
import { useOpenWalletModal } from '@0xsequence/wallet-widget'

const MyComponent = () => {
  const { setOpenWalletModal } = useOpenWalletModal()

  const onClick = () => {
    setOpenWalletModal(true)
  }

  return <button onClick={onClick}>open wallet</button>
}
```

# Trails widget customization

You can override the Trails widget styling via the connect config. Provide a single CSS string or per-theme values:

```js
import { SequenceConnect, createConfig } from '@0xsequence/connect'

const config = createConfig('waas', {
  projectAccessKey: '<your-project-access-key>',
  waasConfigKey: '<your-waas-config-key>',
  defaultTheme: 'light',
  trailsCustomCSS: {
    light: '/* custom light theme CSS */',
    dark: '/* custom dark theme CSS */'
  }
})
```