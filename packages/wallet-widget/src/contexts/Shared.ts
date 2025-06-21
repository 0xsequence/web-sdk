import { createGenericContext } from './genericContext.js'

export interface SharedContext {
  isGuest: boolean
  signInDisplay: string
}

const [useSharedContext, SharedContextProvider] = createGenericContext<SharedContext>()

export { SharedContextProvider, useSharedContext }
