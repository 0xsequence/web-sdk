import { SequenceConnectInline, type SequenceConnectConfig } from '@0xsequence/connect'
import { Text } from '@0xsequence/design-system'
import { Footer } from 'example-shared-components'
import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'

import { config } from '../config'

export const InlineDemo = () => {
  const navigate = useNavigate()

  const inlineConfig: SequenceConnectConfig = useMemo(
    () => ({
      ...config,
      connectConfig: {
        ...config.connectConfig,
        onConnectSuccess: (address: string) => {
          console.log('Connected successfully with address:', address)
          // Redirect to homepage after successful connection
          navigate('/')
        }
      }
    }),
    [navigate]
  )

  return (
    <main className="flex flex-col h-screen">
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="flex flex-row gap-8 max-w-6xl w-full">
          {/* Left side - Description */}
          <div className="flex-1 flex flex-col justify-center gap-4">
            <Text variant="xlarge" fontWeight="bold" color="primary">
              Inline Connect Demo
            </Text>
            <Text variant="large" color="secondary">
              This demonstrates the SequenceConnectInline component, which renders the connect UI inline within your layout
              instead of in a modal.
            </Text>
            <Text variant="normal" color="muted">
              Perfect for custom layouts, embedded wallet experiences, or when you want the connect UI to be part of your page
              flow.
            </Text>
            <Text variant="small" color="muted" className="mt-4">
              Connect with your wallet and you'll be redirected to the homepage automatically.
            </Text>
          </div>

          {/* Right side - Inline Connect UI */}
          <div className="flex-1 flex items-center justify-center">
            <div className="w-full max-w-[390px]">
              <SequenceConnectInline config={inlineConfig} />
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  )
}
