'use client'

import { createGenericContext } from './genericContext'

export interface EnvironmentOverrides {
  marketplaceApiUrl: string
  transakApiUrl: string
  transakApiKey: string
  sardineApiUrl: string
}

const [useEnvironmentContext, EnvironmentContextProvider] = createGenericContext<EnvironmentOverrides>()

export { useEnvironmentContext, EnvironmentContextProvider }
