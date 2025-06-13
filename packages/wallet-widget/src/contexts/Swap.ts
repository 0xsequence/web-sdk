import type { Token } from '@0xsequence/api'

import { createGenericContext } from './genericContext.js'

export interface SwapContext {
  lifiChains: number[]
  lifiTokens: Token[]
}

const [useSwapContext, SwapContextProvider] = createGenericContext<SwapContext>()

export { SwapContextProvider, useSwapContext }
