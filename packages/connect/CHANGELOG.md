# @0xsequence/connect

## 5.1.0

### Minor Changes

- immutable connector release; other fixes

### Patch Changes

- Updated dependencies []:
  - @0xsequence/hooks@5.1.0

## 5.0.9

### Patch Changes

- Wallet linking fixes

- Updated dependencies []:
  - @0xsequence/hooks@5.0.9

## 5.0.8

### Patch Changes

- various fixes related to iframes, credit card providers, documentation

- Updated dependencies []:
  - @0xsequence/hooks@5.0.8

## 5.0.7

### Patch Changes

- approvedSpenderAddress field integrated to approve step in checkout

- Updated dependencies []:
  - @0xsequence/hooks@5.0.7

## 5.0.6

### Patch Changes

- Stricter lint rules for react hooks and related fixes

- Updated dependencies []:
  - @0xsequence/hooks@5.0.6

## 5.0.5

### Patch Changes

- Fixing marketplace api url

- Updated dependencies []:
  - @0xsequence/hooks@5.0.5

## 5.0.4

### Patch Changes

- Ecosystem wallet connector

- Updated dependencies []:
  - @0xsequence/hooks@5.0.4

## 5.0.3

### Patch Changes

- Sardine onramp and design-system theme fix

- Updated dependencies []:
  - @0xsequence/hooks@5.0.3

## 5.0.2

### Patch Changes

- Fixing hex encoding of encodeFunctionData while sending collectibles

- Updated dependencies []:
  - @0xsequence/hooks@5.0.2

## 5.0.1

### Patch Changes

- Wallet widget styles were not being included in the css build

- Updated dependencies []:
  - @0xsequence/hooks@5.0.1

## 5.0.0

### Major Changes

- Web SDK - Initial release

### Patch Changes

- Updated dependencies []:
  - @0xsequence/hooks@5.0.0

## 4.6.5

### Patch Changes

- added custom callback to credit card providers

## 4.6.4

### Patch Changes

- Fix for sponsored transactions

## 4.6.3

### Patch Changes

- Swap flow for tokens, various fixes

## 4.6.2

### Patch Changes

- Update wagmi to ^2.14.11

## 4.6.1

### Patch Changes

- Swap flow in inventory, stricter peer dependencies

## 4.6.0

### Minor Changes

- Connect modal design update, checkout UX improvements, readOnlyNetworks config option for wallet, multiple connection support, new OTP flow

## 4.5.9

### Patch Changes

- improvements to nft checkout

## 4.5.8

### Patch Changes

- Fixing process.env inclusion

## 4.5.7

### Patch Changes

- QR code improvement for NFT checkout

## 4.5.6

### Patch Changes

- Options objects passed to wallet modal to set a default nav

## 4.5.5

### Patch Changes

- Embedded wallet signTypedData fix

## 4.5.4

### Patch Changes

- Adding onClose logic to checkout modals

## 4.5.3

### Patch Changes

- Adding unsponsored fee options

## 4.5.2

### Patch Changes

- Fixing walletconnect default chainId

## 4.5.1

### Patch Changes

- Updating onEmailConflict listeners to handle multiple providers

## 4.5.0

### Minor Changes

- Adding metamask connector

## 4.4.6

### Patch Changes

- Updating sequence to include fix for projectAccessKey sending to universal wallet

## 4.4.5

### Patch Changes

- Fixing waas time drift

## 4.4.4

### Patch Changes

- Added generic swap modal and transaction status modal

## 4.4.3

### Patch Changes

- Fixing sequence logo svg linear gradient in Safari

## 4.4.2

### Patch Changes

- Allow useSignInEmail to get email for waas and universal wallets

## 4.4.1

### Patch Changes

- fix for payment selection modal

## 4.4.0

### Minor Changes

- Updating sequence.js and fixing multiple isSignedIn request issues

## 4.3.2

### Patch Changes

- Updated swap api calls

## 4.3.1

### Patch Changes

- Fixing css export

## 4.3.0

### Minor Changes

- Removed peer dependency on design-system moved custom css file to kit package

## 4.2.0

### Minor Changes

- Updating enabling/disabling connector options

## 4.1.0

### Minor Changes

- Added createConfig and SequenceKit wrapper component to simplify dapp setup

## 4.0.6

### Patch Changes

- Payment Selection Modal

## 4.0.5

### Patch Changes

- Update sequence deps

## 4.0.4

### Patch Changes

- Added New payment providers

## 4.0.3

### Patch Changes

- Update sequence.js

## 4.0.2

### Patch Changes

- Updated to Sequence v2.0.1

## 4.0.1

### Patch Changes

- Update ethauth to fix ethers-v6 compat.

## 4.0.0

### Major Changes

- Migrated to Ethers v6.13.0 and Sequence v2.0.0

## 3.0.0

### Major Changes

- Moved the design system library to a peer dependency. The associated css imports will now have to be added to the top-level of the application

## 2.11.4

### Patch Changes

- Fix for nft checkout modal

## 2.11.3

### Patch Changes

- Changed urls for nft checkout

## 2.11.2

### Patch Changes

- New component for sequence kit previews

## 2.11.1

### Patch Changes

- Connect wallet content separation

## 2.11.0

### Minor Changes

- Sequence Waas v2 upgrade

## 2.10.1

### Patch Changes

- Fixing email auth

## 2.10.0

### Minor Changes

- Merged kit-connectors package into kit

## 2.9.0

### Minor Changes

- Move email sign in option to social auth options row

## 2.8.11

### Patch Changes

- Updating sequence.js to v1.9.34

## 2.8.10

### Patch Changes

- export getTransakLink util

## 2.8.9

### Patch Changes

- Fix issue with NFT checkout that causes the flow to refresh upon switching tabs

## 2.8.8

### Patch Changes

- Added approvedSpenderAddress to kit checkout

## 2.8.7

### Patch Changes

- Simplified credit card checkout flow

## 2.8.6

### Patch Changes

- Added a way to disable to the useCheckoutWhitelistStatus hook

## 2.8.5

### Patch Changes

- Added useWaasSignInEmail hook to kit

## 2.8.4

### Patch Changes

- Added hook for checking sardine status

## 2.8.3

### Patch Changes

- Update to NFT Checkout

## 2.8.2

### Patch Changes

- Added ability to purchase cryptocurrencies with credit card to kit-checkout

## 2.8.1

### Patch Changes

- Fix exports of email waas

## 2.8.0

### Minor Changes

- Turbo repo with unbundled package exports

## 2.7.0

### Minor Changes

- Adding email waas support

## 2.6.1

### Patch Changes

- Refactored GoogleWaasConnectButton and AppleWaasConnectButton

- Updated dependencies []:
  - @0xsequence/kit-connectors@2.6.1

## 2.6.0

### Minor Changes

- Generalized all storage access to wagmi storage and refined exports

### Patch Changes

- Updated dependencies []:
  - @0xsequence/kit-connectors@2.6.0

## 2.5.1

### Patch Changes

- Removing dependency from kit to wallet

- Updated dependencies []:
  - @0xsequence/kit-connectors@2.5.1

## 2.5.0

### Minor Changes

- Remove dependency on vanilla-extract

### Patch Changes

- Updated dependencies []:
  - @0xsequence/kit-connectors@2.5.0
  - @0xsequence/kit-wallet@2.5.0

## 2.4.2

### Patch Changes

- Fixing email login

- Updated dependencies []:
  - @0xsequence/kit-connectors@2.4.2
  - @0xsequence/kit-wallet@2.4.2

## 2.4.0

### Minor Changes

- Support Next SSR

### Patch Changes

- Updated dependencies []:
  - @0xsequence/kit-connectors@2.4.0
  - @0xsequence/kit-wallet@2.4.0

## 2.3.0

### Minor Changes

- Upgraded to wagmi v2.5.20

### Patch Changes

- Updated dependencies []:
  - @0xsequence/kit-connectors@2.3.0
  - @0xsequence/kit-wallet@2.3.0

## 2.2.2

### Patch Changes

- Fix ConnectButton Logo sizes

- Updated dependencies []:
  - @0xsequence/kit-connectors@2.2.2
  - @0xsequence/kit-wallet@2.2.2

## 2.2.1

### Patch Changes

- Fixes cjs build

- Updated dependencies []:
  - @0xsequence/kit-connectors@2.2.1
  - @0xsequence/kit-wallet@2.2.1

## 2.2.0

### Minor Changes

- Adding EIP6963 wallet discovery

### Patch Changes

- Updated dependencies []:
  - @0xsequence/kit-connectors@2.2.0
  - @0xsequence/kit-wallet@2.2.0

## 0.0.1
