import type { Wallet } from '@0xsequence/kit'

import { ImmutableLogo } from './ImmutableLogo'

import { immutableConnector, type BaseImmutableConnectorOptions } from '../wagmiConnector'

export interface ImmutableOptions extends BaseImmutableConnectorOptions {}

export const immutable = (options: ImmutableOptions): Wallet => ({
  id: 'immutable',
  isSequenceBased: false,
  logoDark: ImmutableLogo,
  logoLight: ImmutableLogo,
  name: 'Immutable',
  createConnector: () => {
    const connector = immutableConnector({
      ...options
    })

    return connector
  }
})