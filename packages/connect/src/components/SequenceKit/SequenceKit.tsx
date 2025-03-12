import { SequenceHooksProvider } from '@0xsequence/web-sdk-hooks'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { State, WagmiProvider } from 'wagmi'

import { SequenceKitConfig } from '../../config/createConfig'
import { DEBUG } from '../../env'
import { SequenceConnectProvider } from '../SequenceConnectProvider'

const defaultQueryClient = new QueryClient()

interface SequenceKitProps {
  config: SequenceKitConfig
  queryClient?: QueryClient
  initialState?: State | undefined
  children: React.ReactNode
}

export const SequenceKit = (props: SequenceKitProps) => {
  const { config, queryClient, children } = props
  const { connectConfig, wagmiConfig } = config

  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient || defaultQueryClient}>
        <SequenceHooksProvider
          value={{
            projectAccessKey: connectConfig.projectAccessKey,
            env: {
              indexerGatewayUrl: DEBUG ? 'https://dev-indexer.sequence.app' : 'https://indexer.sequence.app',
              metadataUrl: DEBUG ? 'https://dev-metadata.sequence.app' : 'https://metadata.sequence.app',
              apiUrl: DEBUG ? 'https://dev-api.sequence.app' : 'https://api.sequence.app',
              indexerUrl: DEBUG ? 'https://dev-indexer.sequence.app' : 'https://indexer.sequence.app',
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
