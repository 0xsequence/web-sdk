'use client'

import type { ConnectConfig } from '../types'

import { createGenericContext } from './genericContext'

const [useConnectConfigContext, ConnectConfigContextProvider] = createGenericContext<ConnectConfig>()

export { ConnectConfigContextProvider, useConnectConfigContext }
