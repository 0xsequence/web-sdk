import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import React from 'react'

import { SequenceHooksProvider } from '../contexts/ConfigContext'

interface CreateWrapperProps {
  children: React.ReactNode
}

export const createWrapper = () => {
  // Creates a new QueryClient for each test
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false
      }
    }
  })

  return ({ children }: CreateWrapperProps) => (
    <QueryClientProvider client={queryClient}>
      <SequenceHooksProvider
        value={{
          projectAccessKey: 'test-access',
          env: {
            indexerGatewayUrl: 'https://indexer-gateway.sequence.app',
            metadataUrl: 'https://metadata.sequence.app',
            apiUrl: 'https://api.sequence.app',
            indexerUrl: 'https://indexer.sequence.app',
            imageProxyUrl: 'https://image-proxy.sequence.app'
          }
        }}
      >
        {children}
      </SequenceHooksProvider>
    </QueryClientProvider>
  )
}
