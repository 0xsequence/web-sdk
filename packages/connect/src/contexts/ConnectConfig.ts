'use client'

import { createGenericContext } from '@0xsequence/common'
import type { ConnectConfig } from '../types.js'

const [useConnectConfigContext, ConnectConfigContextProvider] = createGenericContext<ConnectConfig>()

export { ConnectConfigContextProvider, useConnectConfigContext }
