# @0xsequence/web-sdk-hooks

React hooks to interface with Sequence services.

Wrap your application with the `SequenceHooksProvider` to provide a config to the hooks.

```tsx
<SequenceHooksProvider
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
</SequenceHooksProvider>
```

## Hooks:

Sequence hooks are grouped into 5 categories, based on the sequence service they interact with:

### API

- useGetCoinPrices
- useGetCollectiblePrices
- useGetExchangeRate

### Indexer

- useGetTransactionHistory
- useGetTransactionHistorySummary

### Indexer Gateway

- useGetNativeTokenBalance
- useGetTokenBalancesSummary
- useGetTokenBalancesDetails
- useGetTokenBalancesByContract
- useGetSingleTokenBalanceSummary

### Metadata

- useGetContractInfo
- useGetMultipleContractInfo
- useGetTokenMetadata

### Combination

- useGetSwapPrices
- useGetSwapQuote

## Usage

### useGetCoinPrices

```tsx
import { useGetCoinPrices } from '@0xsequence/web-sdk-hooks'

const { data, isLoading, error } = useGetCoinPrices(
  [
    {
      chainId: 1,
      contractAddress: '0x0123456789012345678901234567890123456789'
    }
  ],
  {
    // options param is optional and default values are below
    disabled: false,
    retry: true
  }
)
```

### useGetCollectiblePrices

```tsx
import { useGetCollectiblePrices } from '@0xsequence/web-sdk-hooks'

const { data, isLoading, error } = useGetCollectiblePrices(
  [
    {
      chainId: 1,
      contractAddress: '0x0123456789012345678901234567890123456789',
      tokenId: '1'
    }
  ],
  {
    // options param is optional and default values are below
    disabled: false,
    retry: true
  }
)
```

### useGetExchangeRate

```tsx
import { useGetExchangeRate } from '@0xsequence/web-sdk-hooks'

const { data, isLoading, error } = useGetExchangeRate('CAD', {
  // options param is optional and default values are below
  disabled: false,
  retry: true
})
```

### useGetTransactionHistory

```tsx
import { useGetTransactionHistory } from '@0xsequence/web-sdk-hooks'

const { data, isLoading, error } = useGetTransactionHistory({
  accountAddress: '0x0123456789012345678901234567890123456789',
  contractAddress: '0x0123456789012345678901234567890123456789', // optional
  tokenId: '1', // optional
  chainId: 1, // optional
  page: { // optional
    pageSize: 10,
    page: 1
  },
  {
    // options param is optional and default values are below
    disabled: false,
    retry: true
  }
})
```

### useGetTransactionHistorySummary

```tsx
import { useGetTransactionHistorySummary } from '@0xsequence/web-sdk-hooks'

const { data, isLoading, error } = useGetTransactionHistorySummary(
  {
    accountAddress: '0x0123456789012345678901234567890123456789',
    chainIds: [1]
  },
  {
    // options param is optional and default values are below
    disabled: false,
    retry: true
  }
)
```

### useGetNativeTokenBalance

```tsx
import { useGetNativeTokenBalance } from '@0xsequence/web-sdk-hooks'

const { data, isLoading, error } = useGetNativeTokenBalance(
  {
    accountAddress: '0x0123456789012345678901234567890123456789',
    chainIds: [1], // either use chainIds or networks name
    networks: ['mainnet']
  },
  {
    // options param is optional and default values are below
    disabled: false,
    retry: true
  }
)
```

### useGetTokenBalancesSummary

```tsx
import { ContractVerificationStatus } from '@0xsequence/indexer'
import { useGetTokenBalancesSummary } from '@0xsequence/web-sdk-hooks'

const { data, isLoading, error } = useGetTokenBalancesSummary(
  {
    chainIds: [1], // either use chainIds or networks name
    networks: ['mainnet'],
    filter: {
      accountAddresses: ['0x0123456789012345678901234567890123456789'],
      contractWhitelist: ['0x0123456789012345678901234567890123456789'],
      contractBlacklist: ['0x0000000000000000000000000000000000000000'],
      contractStatus: ContractVerificationStatus.VERIFIED,
      omitNativeBalances: false
    },
    omitMetadata: false, // optional
    page: {
      // optional
      pageSize: 10,
      page: 1
    }
  },
  {
    // options param is optional and default values are below
    disabled: false,
    retry: true,
    hideCollectibles: false
  }
)
```

### useGetTokenBalancesDetails

```tsx
import { ContractVerificationStatus } from '@0xsequence/indexer'
import { useGetTokenBalancesDetails } from '@0xsequence/web-sdk-hooks'

const { data, isLoading, error } = useGetTokenBalancesDetails(
  {
    chainIds: [1], // either use chainIds or networks name
    networks: ['mainnet'],
    filter: {
      accountAddresses: ['0x0123456789012345678901234567890123456789'],
      contractWhitelist: ['0x0123456789012345678901234567890123456789'],
      contractBlacklist: ['0x0000000000000000000000000000000000000000'],
      contractStatus: ContractVerificationStatus.VERIFIED,
      omitNativeBalances: false
    },
    omitMetadata: false, // optional
    page: {
      // optional
      pageSize: 10,
      page: 1
    }
  },
  {
    // options param is optional and default values are below
    disabled: false,
    retry: true,
    hideCollectibles: false
  }
)
```

### useGetTokenBalancesByContract

```tsx
import { ContractVerificationStatus } from '@0xsequence/indexer'
import { useGetTokenBalancesByContract } from '@0xsequence/web-sdk-hooks'

const { data, isLoading, error } = useGetTokenBalancesByContract(
  {
    chainIds: [1], // either use chainIds or networks name
    networks: ['mainnet'],
    filter: {
      accountAddresses: ['0x0123456789012345678901234567890123456789'],
      contractWhitelist: ['0x0123456789012345678901234567890123456789'],
      contractBlacklist: ['0x0000000000000000000000000000000000000000'],
      contractStatus: ContractVerificationStatus.VERIFIED,
      omitNativeBalances: false
    },
    omitMetadata: false, // optional
    page: {
      // optional
      pageSize: 10,
      page: 1
    }
  },
  {
    // options param is optional and default values are below
    disabled: false,
    retry: true,
    hideCollectibles: false
  }
)
```

### useGetSingleTokenBalanceSummary

```tsx
import { useGetSingleTokenBalanceSummary } from '@0xsequence/web-sdk-hooks'

const { data, isLoading, error } = useGetSingleTokenBalanceSummary({
  chainId: 1,
  accountAddress: '0x9876543210987654321098765432109876543210',
  contractAddress: '0x0123456789012345678901234567890123456789'
})
```

### useGetContractInfo

```tsx
import { useGetContractInfo } from '@0xsequence/web-sdk-hooks'

const { data, isLoading, error } = useGetContractInfo(
  {
    chainId: 1,
    contractAddress: '0x0123456789012345678901234567890123456789'
  },
  {
    // options param is optional and default values are below
    disabled: false,
    retry: true
  }
)
```

### useGetMultipleContractInfo

```tsx
import { useGetMultipleContractInfo } from '@0xsequence/web-sdk-hooks'

const { data, isLoading, error } = useGetMultipleContractInfo(
  [
    { chainId: 1, contractAddress: '0x0123456789012345678901234567890123456789' },
    { chainId: 1, contractAddress: '0x0123456789012345678901234567890123456789' }
  ],
  {
    // options param is optional and default values are below
    disabled: false,
    retry: true
  }
)
```

### useGetTokenMetadata

```tsx
import { useGetTokenMetadata } from '@0xsequence/web-sdk-hooks'

const { data, isLoading, error } = useGetTokenMetadata(
  {
    chainId: '1',
    contractAddress: '0x0123456789012345678901234567890123456789',
    tokenIds: ['1']
  },
  {
    // options param is optional and default values are below
    disabled: false,
    retry: true
  }
)
```

### useGetSwapPrices

```tsx
import { useGetSwapPrices } from '@0xsequence/web-sdk-hooks'

const { data, isLoading, error } = useGetSwapPrices({
  userAddress: '0x0123456789012345678901234567890123456789',
  buyCurrencyAddress: '0x0123456789012345678901234567890123456789',
  buyAmount: '1',
  chainId: 1,
  withContractInfo: true // optional
})
```

### useGetSwapQuote

```tsx
import { useGetSwapQuote } from '@0xsequence/web-sdk-hooks'

const { data, isLoading, error } = useGetSwapQuote({
  userAddress: '0x9876543210987654321098765432109876543210',
  buyCurrencyAddress: '0x0123456789012345678901234567890123456789',
  sellCurrencyAddress: '0x0123456789012345678901234567890123456789',
  buyAmount: '1',
  chainId: 1,
  includeApprove: true,
  slippagePercentage: 5 // optional
})
```
