
# Sequence Wallet Widget SDK

[@0xsequence/wallet-widget](https://www.npmjs.com/package/@0xsequence/wallet-widget/v/0.0.0-20250924112110) is a production ready wallet widget with built-in swap, transaction history, inventory, fiat onramp and more, designed to be used in your own application with a few lines of code.

## Key Features

- UI/UX ready 
- Multichain interface
- Swaps
- Transaction history
- Coin and NFT Inventory
- Fund your wallet with fiat or crypto
- Wallet management (settings, wallet linking, etc...)
- Send and receive crypto with QR code
- Filters and customization options

# Quickstart

1. First make sure you have installed and setup [@0xsequence/connect](https://www.npmjs.com/package/@0xsequence/connect/v/0.0.0-20250924112110)

2. Install the package:
```bash
npm install @0xsequence/wallet-widget @0xsequence/checkout @0xsequence/hooks
# or
pnpm install @0xsequence/wallet-widget @0xsequence/checkout @0xsequence/hooks
# or
yarn add @0xsequence/wallet-widget @0xsequence/checkout @0xsequence/hooks
```

3. Wrap your app with the SequenceWalletProvider.

```typescript [main.tsx]
    import React from "react";
    import ReactDOM from "react-dom/client";
    import "./index.css";
    import { config } from "./config";

    import App from "./App";
    import { SequenceWalletProvider } from "@0xsequence/wallet-widget";
    import { SequenceConnect } from "@0xsequence/connect";

    function Dapp() {
        return (
            <SequenceConnect config={config}>
                <SequenceWalletProvider>
                    <App />
                </SequenceWalletProvider>
            </SequenceConnect>
        );
    }

    ReactDOM.createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
        <Dapp />
    </React.StrictMode>
    );
```

4. Trigger the wallet widget 

```typescript [App.tsx]
import { useOpenWalletModal } from '@0xsequence/wallet-widget'

function App() {
  const { setOpenWalletModal } = useOpenWalletModal()
  
  const handleViewWalletWidget = () => {
    setOpenWalletModal(true) 
  }
  
  return (
    <button 
      onClick={handleViewWalletWidget}
      title="Wallet Widget"
    >
      View your wallet
    </button>
  )
}
```

### For more information, please visit the [Wallet Widget SDK documentation](https://docs.sequence.xyz/sdk/web/wallet-widget-sdk/getting-started).

# Opening the embedded wallet

The embedded wallet modal can be summoned with the `useOpenWalletModal` hook.

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
