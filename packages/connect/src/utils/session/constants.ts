import { Permission } from '@0xsequence/dapp-client'

export const SEQUENCE_VALUE_FORWARDER = '0xABAAd93EeE2a569cF0632f39B10A9f5D734777ca'

export const PARAMETER_OPERATIONS = {
  EQUAL: Permission.ParameterOperation.EQUAL,
  NOT_EQUAL: Permission.ParameterOperation.NOT_EQUAL,
  LESS_THAN_OR_EQUAL: Permission.ParameterOperation.LESS_THAN_OR_EQUAL,
  GREATER_THAN_OR_EQUAL: Permission.ParameterOperation.GREATER_THAN_OR_EQUAL
}
