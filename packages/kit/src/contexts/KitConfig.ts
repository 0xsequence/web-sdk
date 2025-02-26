'use client'

import { KitConfig } from '../types'

import { createGenericContext } from './genericContext'

export const [useKitConfig, KitConfigContextProvider] = createGenericContext<KitConfig>()
