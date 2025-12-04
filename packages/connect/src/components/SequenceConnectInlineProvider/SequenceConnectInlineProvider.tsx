import type { ReactNode } from 'react'

import type { ConnectConfig } from '../../types.js'
import { SequenceConnectProvider } from '../SequenceConnectProvider/index.js'

interface SequenceConnectInlineProviderProps {
  config: ConnectConfig
  children?: ReactNode
}

export const SequenceConnectInlineProvider = ({ config, children }: SequenceConnectInlineProviderProps) => {
  return <SequenceConnectProvider config={config}>{children}</SequenceConnectProvider>
}
