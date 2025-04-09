# Immutable connector for Sequence Web-SDK

## Installation

To install this package:

```bash
npm install @0xsequence/immutable-connector @imtbl/config @imtbl/sdk
# or

pnpm install @0xsequence/immutable-connector @imtbl/config @imtbl/sdk
# or
yarn add @0xsequence/immutable-connector @imtbl/config @imtbl/sdk
```

## Adding the connect

First, an Immutable Passport instance must be created with valid and correctly configured Immutable keys.

Note, that the application will need a callback route configured similarly to this example: https://github.com/immutable/ts-immutable-sdk/blob/main/examples/passport/login-with-nextjs/src/app/redirect/page.tsx

Also, the `forceScwDeployBeforeMessageSignature` parameter must be set to true for the signing of message to work for new users.

```js
export const passportInstance = new passport.Passport({
  baseConfig: {
    environment: Environment.SANDBOX,
    publishableKey: 'my_publisheable_key'
  },
  forceScwDeployBeforeMessageSignature: true,
  clientId: 'my_client_id',
  redirectUri: `${window.location.origin}/auth/callback`,
  audience: 'platform_api',
  scope: 'openid offline_access email transact'
})
```

Finally, the wallet can be passed down to the web-sdk configuration similarly to other wallets,

```js
immutable({
  passportInstance,
  environment: Environment.SANDBOX
})
```
