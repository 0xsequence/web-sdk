# Multiple Contract Permissions Example

This example shows how to create permissions for multiple contracts using the `createContractPermissions` function.

## Usage

You can pass multiple contracts to `createContractPermissions` and it will create separate Permission objects for each function:

```typescript
import { createConfig, createContractPermissions, createSession } from "@0xsequence/connect";

const session = createSession({
    chainId: 42161,
    nativeTokenSpendingLimit: 0n,
    expiresIn: {
        minutes: 1,
    },
    permissions: createContractPermissions({
        contracts: [
            {
                contract: '0x794a61358D6845594F94dc1DB02A252b5b4814aD', // AAVE V3 Pool
                functions: [
                    {
                        functionSignature: 'function supply(address asset, uint256 amount, address onBehalfOf, uint16 referralCode)',
                        rules: [
                            {
                                param: 'asset',
                                type: 'address',
                                condition: 'EQUAL',
                                value: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831'
                            },
                            {
                                param: 'amount',
                                type: 'uint256',
                                condition: 'LESS_THAN_OR_EQUAL',
                                value: BigInt(10000),
                                cumulative: true
                            }
                        ]
                    },
                    {
                        functionSignature: 'function withdraw(address asset, uint256 amount, address to)',
                        rules: [
                            {
                                param: 'asset',
                                type: 'address',
                                condition: 'EQUAL',
                                value: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831'
                            }
                        ]
                    }
                ]
            },
            {
                contract: '0x33985d320809E26274a72E03268c8a29927Bc6dA', // Emitter contract
                functions: [{
                    functionSignature: 'function explicitEmit()'
                }]
            },
            {
                contract: '0xAnotherContractAddress', // Another contract
                functions: [
                    {
                        functionSignature: 'function transfer(address to, uint256 amount)',
                        rules: [
                            {
                                param: 'amount',
                                type: 'uint256',
                                condition: 'LESS_THAN_OR_EQUAL',
                                value: BigInt(1000)
                            }
                        ]
                    }
                ]
            }
        ]
    })
});
```

## Key Points

1. **Each function gets its own Permission object**: Each function across all contracts gets its own separate Permission object with its own `target` and `rules`.

2. **Clean API**: No spread operators needed - just pass an array of contracts to `createContractPermissions`.

3. **Multiple contracts supported**: You can include as many contracts as you want in the `contracts` array.

4. **Type safety**: The TypeScript types ensure that each function's rules are properly typed and validated.

## Result

This will create a session with separate Permission objects for each function:
- `supply` function on AAVE V3 Pool contract
- `withdraw` function on AAVE V3 Pool contract  
- `explicitEmit` function on the emitter contract
- `transfer` function on the third contract

Each Permission object will have its own `target` address and `rules` array, ensuring proper isolation and validation.
