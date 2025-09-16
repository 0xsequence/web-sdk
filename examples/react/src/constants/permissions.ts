import { createContractPermission, createExplicitSession } from '@0xsequence/connect'
import { Permission, Signers } from '@0xsequence/dapp-client'
import { Abi, AbiFunction, Address } from 'ox'
import { optimism } from 'viem/chains'

export const transfer = AbiFunction.from(['function transfer(address to, uint256 value)'])

export type PermissionsType = 'none' | 'contractCall' | 'usdcTransfer' | 'combined'

export const PERMISSION_TYPE_LOCAL_STORAGE_KEY = 'permissionType'

export const EMITTER_ABI = Abi.from(['function explicitEmit()', 'function implicitEmit()'])

export const getEmitterContractAddress = (redirectUrl: string): Address.Address => {
  switch (redirectUrl) {
    case 'http://localhost:4444':
    case 'http://localhost:4445': // Intentionally broken
      // Implicit validation for 'http://localhost:4444'
      return '0x33985d320809E26274a72E03268c8a29927Bc6dA'
    case 'https://demo-dapp-v3.pages.dev':
      // Implicit validation for 'https://demo-dapp-v3.pages.dev'
      return '0x8F6066bA491b019bAc33407255f3bc5cC684A5a4'
    default:
      // No implicit validation against URLs
      return '0xb7bE532959236170064cf099e1a3395aEf228F44'
  }
}

export const USDC_ADDRESS = '0x7F5c764cBc14f9669B88837ca1490cCa17c31607' // Op mainnet

// Permission for a specific contract call
export const getContractCallPermission = (redirectUrl: string): Permission.Permission => {
  const emitterContractAddress = getEmitterContractAddress(redirectUrl)
  return createContractPermission({
    address: emitterContractAddress,
    functionSignature: 'function explicitEmit()'
  })
}

// Permission for USDC transfers (on Optimism)
export const getUsdcPermission = (chainId: number): Permission.Permission => {
  const permission =
    chainId === optimism.id
      ? createContractPermission({
          address: USDC_ADDRESS,
          functionSignature: 'function transfer(address to, uint256 value)'
        })
      : undefined

  if (!permission) {
    throw new Error(`This example permission is set up only for Optimism (chain id: ${optimism.id}).`)
  }

  return permission
}

// 3. Combined permission for both contract call and USDC transfer
export const getCombinedPermission = (redirectUrl: string, chainId: number): Signers.Session.ExplicitParams => {
  const contractCallPermission = createContractPermission({
    address: getEmitterContractAddress(redirectUrl),
    functionSignature: 'function explicitEmit()'
  })
  const usdcPermission = getUsdcPermission(chainId)

  return createExplicitSession({
    chainId: chainId,
    nativeTokenSpending: {
      valueLimit: 0n
    },
    expiresIn: {
      days: 1
    },
    permissions: [contractCallPermission, usdcPermission]
  })
}

export const getSessionConfigForType = (
  redirectUrl: string,
  chainId: number,
  type: PermissionsType
): Signers.Session.ExplicitParams | undefined => {
  switch (type) {
    case 'contractCall':
      return createExplicitSession({
        chainId: chainId,
        nativeTokenSpending: {
          valueLimit: 0n
        },
        expiresIn: {
          days: 1
        },
        permissions: [getContractCallPermission(redirectUrl)]
      })
    case 'usdcTransfer':
      return createExplicitSession({
        chainId: chainId,
        nativeTokenSpending: {
          valueLimit: 0n
        },
        expiresIn: {
          days: 1
        },
        permissions: [getUsdcPermission(chainId)]
      })
    case 'combined':
      return createExplicitSession({
        chainId: chainId,
        nativeTokenSpending: {
          valueLimit: 0n
        },
        expiresIn: {
          days: 1
        },
        permissions: [getContractCallPermission(redirectUrl), getUsdcPermission(chainId)]
      })
    case 'none':
      return undefined // No permissions
    default:
      throw new Error(`Unknown permission type: ${type}`)
  }
}
