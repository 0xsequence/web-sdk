## Migration from kit to web-sdk

0xsequence/kit is now 0xsequence/web-sdk as of version 5.0.0.

### Package names

Make sure to update your dependencies:

- @0xsequence/kit
- @0xsequence/kit-wallet
- @0xsequence/kit-checkout

are now:

- @0xsequence/connect
- @0xsequence/wallet-widget
- @0xsequence/checkout
- @0xsequence/hooks

### Common hooks

Common hooks have now been moved to their own package `@0xsequence/hooks`. These hooks can be used to interface with various sequence services like Sequence API, Sequence Indexer, Sequence Metadata.

**Deprecated data hooks have been removed and you are required to use hooks from @0xsequence/hooks instead**

### Providers

Providers and their Contexts have been renamed as well. Rather than Kit* they are now Sequence*.

ie.

- `SequenceConnectProvider` (previously KitProvider)
- `SequenceCheckoutProvider` (previously KitCheckoutProvider)
- `SequenceWalletProvider` (previously KitWalletProvider)
- `SequenceHooksProvider`

Also for builder integration KitPreviewProvider was renamed `SequenceConnectPreviewProvider`

### Hooks

- `useWallets` (previously useKitWallets)

### Migrating configuration

Due to the naming differences some providers, methods, and types have changed.

`SequenceKit` wrapper was renamed to `SequenceConnect`
