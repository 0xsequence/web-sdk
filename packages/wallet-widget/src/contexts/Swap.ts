import type { Token } from '@0xsequence/api'
import { createGenericContext } from '@0xsequence/common'

export interface SwapContext {
  lifiChains: number[]
  lifiTokens: Token[]
}

const [useSwapContext, SwapContextProvider] = createGenericContext<SwapContext>()

export { SwapContextProvider, useSwapContext }
