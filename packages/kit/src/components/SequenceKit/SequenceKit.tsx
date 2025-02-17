import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { State, WagmiProvider } from 'wagmi'

import { SequenceKitConfig } from '../../config/createConfig'
import { KitProvider } from '../KitProvider'

import { ReactHooksConfigProvider } from '@0xsequence/react-hooks'

const defaultQueryClient = new QueryClient()

interface SequenceKitProps {
  config: SequenceKitConfig
  queryClient?: QueryClient
  initialState?: State | undefined
  children: React.ReactNode
}

export const SequenceKit = (props: SequenceKitProps) => {
  const { config, queryClient, children } = props
  const { kitConfig, wagmiConfig } = config

  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient || defaultQueryClient}>
        <ReactHooksConfigProvider
          value={{
            projectAccessKey: kitConfig.projectAccessKey,
            env: {
              indexerGatewayUrl: 'https://indexer.sequence.app',
              metadataUrl: 'https://metadata.sequence.app',
              indexerUrl: 'https://indexer.sequence.app',
              imageProxyUrl: 'https://imgproxy.sequence.xyz/'
            }
          }}
        >
          <KitProvider config={kitConfig}>{children}</KitProvider>
        </ReactHooksConfigProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}
