import { type ExplicitSessionConfig } from '@0xsequence/dapp-client'
import type { Address } from 'viem'

import type { ExplicitSessionParams, Permission } from './types.js'

/**
 * Assembles an Explicit Session Config object, to be used to create an explicit session.
 *
 * This helper function creates an explicit session between the dapp and the connected user wallet.
 *
 * It automatically includes a permission for the SEQUENCE_VALUE_FORWARDER contract to enable the dApp to pay gas fees using the user's native token.
 *
 * @param options The complete configuration for the session.
 * @returns The final, ready-to-use object that can be used with Sequence V3 connectors.
 */
export function createExplicitSessionConfig(params: ExplicitSessionParams): ExplicitSessionConfig {
  // Calculate the session deadline.
  const nowInSeconds = BigInt(Math.floor(Date.now() / 1000))

  const { days = 0, hours = 0, minutes = 0 } = params.expiresIn
  const sessionLifetimeSeconds = days * 24 * 60 * 60 + hours * 60 * 60 + minutes * 60

  // deadline in seconds
  const deadline = nowInSeconds + BigInt(sessionLifetimeSeconds)

  // Ensure we have at least one permission
  if (params.permissions.length === 0) {
    throw new Error('createExplicitSessionParams: At least one permission is required.')
  }

  const nativeTokenReceivers: Address[] = [...(params.nativeTokenSpending?.allowedRecipients || [])]

  const nativeTokenSpendingPermissions = nativeTokenReceivers.map(receiver => ({
    target: receiver as Address,
    rules: []
  }))

  // Assemble and return the final SessionObject.
  const explicitSessionParams: ExplicitSessionConfig = {
    chainId: params.chainId,
    valueLimit: params.nativeTokenSpending?.valueLimit ?? 0n,
    deadline,
    permissions: [...params.permissions, ...nativeTokenSpendingPermissions] as Permission[]
  }

  return explicitSessionParams
}
