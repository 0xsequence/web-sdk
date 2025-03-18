'use client'

import { ConnectConfig } from '../types'

import { createGenericContext } from './genericContext'

const [useConnectConfigContext, ConnectConfigContextProvider] = createGenericContext<ConnectConfig>()

export { useConnectConfigContext, ConnectConfigContextProvider }
