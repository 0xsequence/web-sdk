---
'@0xsequence/connect': patch
---

Fix WalletConnect connections that can hang when the connector tries to switch to the configured default chain during connect.

WalletConnect now establishes the session on the wallet's current chain before attempting a best-effort switch to the requested or default chain. Requested chain IDs are applied after the base WalletConnect session opens, and the automatic switch is bounded by a short timeout so wallets that do not settle `switchChain` can still finish connecting.

Default connector configuration also accepts `walletConnect.customStoragePrefix`, allowing apps that run another WalletConnect core to opt into an isolated WalletConnect storage namespace without changing the default storage behavior for existing sessions.
