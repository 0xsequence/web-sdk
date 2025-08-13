import { Signers, Utils } from '@0xsequence/wallet-core'
import { Permission } from '@0xsequence/wallet-primitives'
import { Abi, AbiFunction, Address, Bytes } from 'ox'
import { optimism } from 'viem/chains'

export const transfer = AbiFunction.from(['function transfer(address to, uint256 value)'])

export type PermissionsType = 'none' | 'contractCall' | 'usdcTransfer' | 'combined'

export const PERMISSION_TYPE_LOCAL_STORAGE_KEY = 'permissionType'

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

export const EMITTER_ABI = Abi.from(['function explicitEmit()', 'function implicitEmit()'])

export const USDC_ADDRESS = '0x7F5c764cBc14f9669B88837ca1490cCa17c31607' // Op mainnet

// 1. Permission for a specific contract call
export const getContractCallPermission = (redirectUrl: string, chainId: number): Signers.Session.ExplicitParams => {
  const emitterContractAddress = getEmitterContractAddress(redirectUrl)
  return {
    chainId: BigInt(chainId),
    valueLimit: 0n,
    deadline: BigInt(Date.now() + 1000 * 60 * 5000),
    permissions: [
      {
        target: emitterContractAddress,
        rules: [
          {
            // Require the explicitEmit selector
            cumulative: false,
            operation: Permission.ParameterOperation.EQUAL,
            value: Bytes.padRight(Bytes.fromHex(AbiFunction.getSelector(EMITTER_ABI[0])), 32),
            offset: 0n,
            mask: Permission.MASK.SELECTOR
          }
        ]
      }
    ]
  }
}

// 2. Permission for USDC transfers (on Optimism)
export const getUsdcPermission = (chainId: number): Signers.Session.ExplicitParams => {
  const permissions =
    chainId === optimism.id ? Utils.PermissionBuilder.for(USDC_ADDRESS).forFunction(transfer).build() : undefined

  if (!permissions) {
    throw new Error(`This example permission is set up only for Optimism (chain id: ${optimism.id}).`)
  }

  return {
    chainId: BigInt(chainId),
    valueLimit: 0n,
    deadline: BigInt(Date.now() + 1000 * 60 * 5000),
    permissions: [permissions]
  }
}

// 3. Combined permission for both contract call and USDC transfer
export const getCombinedPermission = (redirectUrl: string, chainId: number): Signers.Session.ExplicitParams => {
  const contractCallPermissions = getContractCallPermission(redirectUrl, chainId).permissions
  const usdcPermissions = getUsdcPermission(chainId).permissions

  return {
    chainId: BigInt(chainId),
    valueLimit: 0n,
    deadline: BigInt(Date.now() + 1000 * 60 * 5000),
    permissions: [...contractCallPermissions, ...usdcPermissions]
  }
}

export const getPermissionForType = (
  redirectUrl: string,
  chainId: number,
  type: PermissionsType
): Signers.Session.ExplicitParams | undefined => {
  switch (type) {
    case 'contractCall':
      return getContractCallPermission(redirectUrl, chainId)
    case 'usdcTransfer':
      return getUsdcPermission(chainId)
    case 'combined':
      return getCombinedPermission(redirectUrl, chainId)
    case 'none':
      return undefined // No permissions
    default:
      throw new Error(`Unknown permission type: ${type}`)
  }
}
