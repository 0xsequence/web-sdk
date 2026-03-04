
# Sequence Hooks SDK

Use [@0xsequence/hooks](https://www.npmjs.com/package/@0xsequence/hooks/v/0.0.0-20250924112110) to query coin prices, swap routes, swap quotes, balances, transaction history, token information and more by leveraging the Sequence API and Indexer.

## Key Features

- Coin prices
- Cross chain swap routes and quotes 
- Multichain balances 
- Transaction history
- Query multiple contracts at once
- Get current active wallet status and information
- Get NFT and token metadata
- Multiple filtering options

# Quickstart

1. Install the package:
```bash
npm install @0xsequence/hooks
# or
pnpm install @0xsequence/hooks
# or
yarn add @0xsequence/hooks
```

2. Wrap your app with the SequenceHooksProvider.

```typescript [main.tsx]
    import React from "react";
    import ReactDOM from "react-dom/client";
    import "./index.css";

    import App from "./App";
    import { SequenceHooksProvider } from "@0xsequence/hooks";

    function Dapp() {
        return (
            <SequenceHooksProvider config={{ projectAccessKey: "AQAAAAAAAABtDHG1It7lxRF_9bbxw4diip8" }}>
                <App />
            </SequenceHooksProvider>
        );
    }

    ReactDOM.createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
        <Dapp />
    </React.StrictMode>
    );
```

3. Start using the hooks in your app.

### For more information, please visit the [Hooks SDK documentation](https://docs.sequence.xyz/sdk/web/hooks-sdk/getting-started).