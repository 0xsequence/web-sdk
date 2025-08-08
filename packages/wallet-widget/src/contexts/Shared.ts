import { createGenericContext } from '@0xsequence/web-sdk-core'

export interface SharedContext {
  isGuest: boolean
  signInDisplay: string
}

const [useSharedContext, SharedContextProvider] = createGenericContext<SharedContext>()

export { SharedContextProvider, useSharedContext }
