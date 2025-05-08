'use client'

import { createGenericContext } from './genericContext.js'

export interface EnvironmentOverrides {
  marketplaceApiUrl: string
  transakApiUrl: string
  transakApiKey: string
  sardineCheckoutUrl: string
  sardineOnRampUrl: string
}

const [useEnvironmentContext, EnvironmentContextProvider] = createGenericContext<EnvironmentOverrides>()

export { EnvironmentContextProvider, useEnvironmentContext }
