'use client'

import { createGenericContext } from '@0xsequence/web-sdk-core'

import type { ConnectConfig } from '../types.js'

const [useConnectConfigContext, ConnectConfigContextProvider] = createGenericContext<ConnectConfig>()

export { ConnectConfigContextProvider, useConnectConfigContext }
