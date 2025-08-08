import type { Token } from '@0xsequence/api'
import { createGenericContext } from '@0xsequence/web-sdk-core'

export interface SwapContext {
  lifiChains: number[]
  lifiTokens: Token[]
}

const [useSwapContext, SwapContextProvider] = createGenericContext<SwapContext>()

export { SwapContextProvider, useSwapContext }
