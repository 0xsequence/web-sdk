import { Permission, Signers } from '@0xsequence/dapp-client'
import type { Address } from 'viem'

/**
 * The options for specifying the duration of a session.
 */
export type SessionDuration = {
  days?: number
  hours?: number
  minutes?: number
}

export type NativeTokenSpending = {
  valueLimit: bigint
  allowedRecipients?: Address[]
}

/**
 * The configuration object for the `createExplicitSession` helper function.
 */
export type CreateExplicitSessionOptions = {
  /** The chain ID for which the session will be valid. */
  chainId: number

  /**
   * The maximum cumulative amount of the native currency (e.g., ETH, MATIC)
   * that can be spent across ALL transactions during this session.
   */
  nativeTokenSpending: NativeTokenSpending

  /**
   * The desired duration of the session. A final `deadline` timestamp will be
   * calculated from this. Defaults to 24 hours if not provided.
   */
  expiresIn: SessionDuration

  /**
   * An array of fully-built permission objects. These should be the direct
   * output from helpers like `createContractPermission`.
   */
  permissions: Permission.Permission[]
}

const SEQUENCE_VALUE_FORWARDER = '0xABAAd93EeE2a569cF0632f39B10A9f5D734777ca'

/**
 * Assembles a complete, ready-to-use smart session object.
 *
 * This helper function creates an explicit session between the dapp and the connected user wallet.
 *
 * It automatically includes a permission for the SEQUENCE_VALUE_FORWARDER contract to enable the dApp to pay gas fees using the user's native token.
 *
 * @param options The complete configuration for the session.
 * @returns The final, ready-to-use object that can be used with Sequence V3 connectors.
 */
export function createExplicitSession(options: CreateExplicitSessionOptions): Signers.Session.ExplicitParams {
  // Calculate the session deadline.
  const nowInSeconds = BigInt(Math.floor(Date.now() / 1000))

  const { days = 0, hours = 0, minutes = 0 } = options.expiresIn
  const sessionLifetimeSeconds = days * 24 * 60 * 60 + hours * 60 * 60 + minutes * 60

  // deadline in seconds
  const deadline = nowInSeconds + BigInt(sessionLifetimeSeconds)

  // Ensure we have at least one permission
  if (options.permissions.length === 0) {
    throw new Error('createExplicitSession: At least one permission is required.')
  }

  // Always include SEQUENCE_VALUE_FORWARDER to enable ETH as fee option
  const nativeTokenReceivers: Address[] = [...(options.nativeTokenSpending.allowedRecipients || [])]
  if (!nativeTokenReceivers.includes(SEQUENCE_VALUE_FORWARDER as Address)) {
    nativeTokenReceivers.push(SEQUENCE_VALUE_FORWARDER as Address)
  }

  const nativeTokenSpendingPermissions = nativeTokenReceivers.map(receiver => ({
    target: receiver as Address,
    rules: []
  }))

  // Assemble and return the final SessionObject.
  const explicitSession: Signers.Session.ExplicitParams = {
    chainId: options.chainId,
    valueLimit: options.nativeTokenSpending.valueLimit,
    deadline,
    permissions: [...options.permissions, ...nativeTokenSpendingPermissions] as Signers.Session.ExplicitParams['permissions']
  }

  return explicitSession
}
