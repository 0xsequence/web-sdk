# @0xsequence/kit-hooks

React hooks to interface with Sequence services.

Wrap your application with the `ReactHooksConfigProvider` to provide a config to the hooks.

```tsx
<ReactHooksConfigProvider
  value={{
    projectAccessKey: 'your-project-access-key',
    env: {
      indexerGatewayUrl: 'your-indexer-gateway-url',
      metadataUrl: 'your-metadata-url',
      apiUrl: 'your-api-url',
      indexerUrl: 'your-indexer-url',
      imageProxyUrl: 'your-image-proxy-url'
    }
  }}
>
  <App />
</ReactHooksConfigProvider>
```
