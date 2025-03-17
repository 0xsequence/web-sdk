import { SequenceHooksProvider, SequenceHooksEnv } from '@0xsequence/react-hooks'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { State, WagmiProvider } from 'wagmi'

import { SequenceConnectConfig } from '../../config/createConfig'
import { SequenceConnectProvider } from '../SequenceConnectProvider'

const defaultQueryClient = new QueryClient()

interface SequenceConnectProps {
  config: SequenceConnectConfig
  envOverrides?: Partial<SequenceHooksEnv>
  queryClient?: QueryClient
  initialState?: State | undefined
  children: React.ReactNode
}

export const SequenceConnect = (props: SequenceConnectProps) => {
  const { config, envOverrides, queryClient, initialState, children } = props
  const { connectConfig, wagmiConfig } = config

  return (
    <WagmiProvider config={wagmiConfig} initialState={initialState}>
      <QueryClientProvider client={queryClient || defaultQueryClient}>
        <SequenceHooksProvider
          value={{
            projectAccessKey: connectConfig.projectAccessKey,
            env: envOverrides
          }}
        >
          <SequenceConnectProvider config={connectConfig}>{children}</SequenceConnectProvider>
        </SequenceHooksProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}
