import { createGenericContext } from '@0xsequence/common'

export interface ValueRegistryPair {
  accountAddress: string
  value: string
}

export interface ValueRegistryContext {
  valueRegistryMap: ValueRegistryPair[]
  totalValue: string
}

const [useValueRegistryContext, ValueRegistryContextProvider] = createGenericContext<ValueRegistryContext>()

export { useValueRegistryContext, ValueRegistryContextProvider }
