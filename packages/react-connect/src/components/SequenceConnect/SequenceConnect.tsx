import { SequenceHooksProvider } from '@0xsequence/react-hooks'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { State, WagmiProvider } from 'wagmi'

import { SequenceConnectConfig } from '../../config/createConfig'
import { isDevSequenceApis } from '../../env'
import { SequenceConnectProvider } from '../SequenceConnectProvider'

const defaultQueryClient = new QueryClient()

interface SequenceConnectProps {
  config: SequenceConnectConfig
  queryClient?: QueryClient
  initialState?: State | undefined
  children: React.ReactNode
}

export const SequenceConnect = (props: SequenceConnectProps) => {
  const { config, queryClient, initialState, children } = props
  const { connectConfig, wagmiConfig } = config

  return (
    <WagmiProvider config={wagmiConfig} initialState={initialState}>
      <QueryClientProvider client={queryClient || defaultQueryClient}>
        <SequenceHooksProvider
          value={{
            projectAccessKey: connectConfig.projectAccessKey,
            env: {
              indexerGatewayUrl: isDevSequenceApis() ? 'https://dev-indexer.sequence.app' : 'https://indexer.sequence.app',
              metadataUrl: isDevSequenceApis() ? 'https://dev-metadata.sequence.app' : 'https://metadata.sequence.app',
              apiUrl: isDevSequenceApis() ? 'https://dev-api.sequence.app' : 'https://api.sequence.app',
              indexerUrl: isDevSequenceApis() ? 'https://dev-indexer.sequence.app' : 'https://indexer.sequence.app',
              imageProxyUrl: 'https://imgproxy.sequence.xyz/'
            }
          }}
        >
          <SequenceConnectProvider config={connectConfig}>{children}</SequenceConnectProvider>
        </SequenceHooksProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}
