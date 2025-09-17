import type { Permission, Signers } from '@0xsequence/dapp-client'
import type { Address } from 'viem'

export type Permission = Permission.Permission

export type ParameterOperation = Permission.ParameterOperation

/**
 * The condition to apply when evaluating a rule against a parameter's value.
 */
export type RuleCondition = 'EQUAL' | 'NOT_EQUAL' | 'LESS_THAN_OR_EQUAL' | 'GREATER_THAN_OR_EQUAL'

/**
 * The supported ABI types for a rule's parameter.
 */
export type ParamType =
  | 'address'
  | 'uint256'
  | 'uint8'
  | 'uint16'
  | 'uint32'
  | 'uint64'
  | 'uint128'
  | 'uint256'
  | 'string'
  | 'bool'
  | 'bytes'
  | 'bytesN'
  | 'int256'
  | 'int8'
  | 'int16'
  | 'int32'
  | 'int64'
  | 'int128'

/**
 * A rule that defines a constraint on a single parameter of a function.
 */
export type Rule = {
  /** The name of the parameter from the function signature (e.g., 'to', 'amount'). */
  param: string

  /** The ABI type of the parameter. This is required to use the correct builder method. */
  type: ParamType

  /** The comparison to perform on the parameter. */
  condition: RuleCondition

  /** The value to compare against. Must match the `type`. */
  value: string | number | bigint | boolean

  /**
   * Determines if the rule's value is a cumulative total across all calls to this function.
   * @default true - This is a safer default.
   */
  cumulative?: boolean
}

/**
 * Defines the permissions for a single function on a contract.
 */
export type FunctionPermission = {
  /**
   * The human-readable function signature.
   * Example: 'function transfer(address to, uint256 amount)'
   */
  functionSignature: string

  /** An array of rules to apply to the function's arguments. */
  rules?: Rule[]

  /**
   * If true, this function can only be successfully called once during the session.
   * @default false
   */
  onlyOnce?: boolean
}

/**
 * The options object for creating permissions for multiple smart contract functions.
 */
export type CreateContractPermissionsOptions = {
  /** The address of the target contract. */
  address: Address

  /** An array of permissions for one or more functions on this contract. */
  functions?: FunctionPermission[] | undefined | null
}

/**
 * The options object for creating a permission.
 */
export type CreateContractPermissionOptions = {
  /** The address of the target contract. */
  address: Address

  /**
   * The human-readable function signature.
   * Example: 'function transfer(address to, uint256 amount)'
   */
  functionSignature?: string

  /** An array of rules to apply to the function's arguments. */
  rules?: Rule[]

  /**
   * If true, this function can only be successfully called once during the session.
   * @default false
   */
  onlyOnce?: boolean
}

export type ExplicitSession = Signers.Session.ExplicitParams

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
 * The configuration object for the {@link createExplicitSession} helper function.
 */
export type CreateExplicitSessionOptions = {
  /** The chain ID for which the session will be valid. */
  chainId: number

  /**
   * An object ({@link NativeTokenSpending}) that defines the maximum amount of native currency that can be spent during the session and allowed recipients for the native currency.
   */
  nativeTokenSpending: NativeTokenSpending

  /**
   * The desired duration of the session. {@link SessionDuration}
   */
  expiresIn: SessionDuration

  /**
   * An array of fully-built permission objects. {@link Permission}
   */
  permissions: Permission[]
}
