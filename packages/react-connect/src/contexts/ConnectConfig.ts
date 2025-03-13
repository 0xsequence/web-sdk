'use client'

import { ConnectConfig } from '../types'

import { createGenericContext } from './genericContext'

export const [useConnectConfigContext, ConnectConfigContextProvider] = createGenericContext<ConnectConfig>()
