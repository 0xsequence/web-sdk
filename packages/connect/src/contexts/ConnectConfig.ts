'use client'

import type { ConnectConfig } from '../types.js'

import { createGenericContext } from './genericContext.js'

const [useConnectConfigContext, ConnectConfigContextProvider] = createGenericContext<ConnectConfig>()

export { ConnectConfigContextProvider, useConnectConfigContext }
