import { createConfig, createContractPermission, createContractPermissions, createExplicitSession } from '@0xsequence/connect'
import { parseEther, parseUnits } from 'viem'

import type { SequenceConnectConfig } from '../../../packages/connect/dist/esm/config/createConfig'

export const USDC_ADDRESS_ARBITRUM = '0xaf88d065e77c8cC2239327C5EDb3A432268e5831'
export const AAVE_V3_POOL_ADDRESS_ARBITRUM = '0x794a61358D6845594F94dc1DB02A252b5b4814aD'
export const AAVE_V3_WRAPPED_TOKEN_GATEWAY_ADDRESS_ARBITRUM = '0x5283BEcEd7ADF6D003225C13896E536f2D4264FF'
export const ALLOWED_RECEIVER = '0xBa47299A5B0d402375BA9A300c28D6Aa4fE788FA'

const aaveSupplySession = createExplicitSession({
  chainId: 42161,
  nativeTokenSpending: {
    valueLimit: parseEther('0.1'),
    allowedRecipients: [ALLOWED_RECEIVER] // Allows direct ETH transfer to this address, optional.
  },
  expiresIn: {
    hours: 1,
    minutes: 30
  },
  permissions: [
    ...createContractPermissions({
      address: AAVE_V3_POOL_ADDRESS_ARBITRUM,
      functions: [
        {
          functionSignature: 'function supply(address asset, uint256 amount, address onBehalfOf, uint16 referralCode)',
          rules: [
            {
              param: 'asset',
              type: 'address',
              condition: 'EQUAL',
              value: USDC_ADDRESS_ARBITRUM
            },
            {
              param: 'amount',
              type: 'uint256',
              condition: 'LESS_THAN_OR_EQUAL',
              value: parseUnits('1', 6),
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
              value: USDC_ADDRESS_ARBITRUM
            }
          ]
        }
      ]
    }),
    ...createContractPermissions({
      address: AAVE_V3_WRAPPED_TOKEN_GATEWAY_ADDRESS_ARBITRUM,
      functions: [
        {
          functionSignature: 'function depositETH(address pool, address onBehalfOf, uint16 referralCode)',
          rules: [
            {
              param: 'pool',
              type: 'address',
              condition: 'EQUAL',
              value: AAVE_V3_POOL_ADDRESS_ARBITRUM
            }
          ]
        },
        {
          functionSignature: 'function withdrawETH(address pool, uint256 amount, address to)',
          rules: [
            {
              param: 'pool',
              type: 'address',
              condition: 'EQUAL',
              value: AAVE_V3_POOL_ADDRESS_ARBITRUM
            }
          ]
        }
      ]
    }),
    createContractPermission({
      address: '0xe50fA9b3c56FfB159cB0FCA61F5c9D750e8128c8',
      functionSignature: 'function approve(address spender, uint256 amount)'
    }),
    createContractPermission({
      address: USDC_ADDRESS_ARBITRUM,
      functionSignature: 'function approve(address spender, uint256 amount)'
    }),
    createContractPermission({
      address: '0x33985d320809E26274a72E03268c8a29927Bc6dA',
      functionSignature: 'function explicitEmit()'
    })
  ]
})

export const config: SequenceConnectConfig = createConfig({
  projectAccessKey: 'AQAAAAAAAEGvyZiWA9FMslYeG_yayXaHnSI',
  signIn: {
    projectName: 'Sequence Web SDK Demo'
  },
  walletUrl: 'http://localhost:5173',
  dappOrigin: window.location.origin,
  appName: 'Sequence Web SDK Demo',
  chainIds: [42161],
  defaultChainId: 42161,
  google: true,
  apple: true,
  email: true,
  explicitSession: aaveSupplySession
})
