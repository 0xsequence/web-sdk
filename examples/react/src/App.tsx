import { SequenceCheckoutProvider } from '@0xsequence/checkout'
import { SequenceConnect } from '@0xsequence/connect'
import { ThemeProvider } from '@0xsequence/design-system'
import { SequenceWalletProvider } from '@0xsequence/wallet-widget'

import { Homepage } from './components/Homepage'
import { config } from './config'

export const App = () => {
  // @ts-ignore
  const isDev = __SEQUENCE_WEB_SDK_IS_DEV__

  const devEnvOverridesConnect = {
    indexerGatewayUrl: 'https://dev-indexer.sequence.app',
    metadataUrl: 'https://dev-metadata.sequence.app',
    apiUrl: 'https://dev-api.sequence.app',
    indexerUrl: 'https://dev-indexer.sequence.app'
  }

  const devEnvOverridesCheckout = {
    sardineApiUrl: 'https://sardine-checkout-sandbox.sequence.info',
    transakApiUrl: 'https://global-stg.transak.com',
    transakApiKey: 'c20f2a0e-fe6a-4133-8fa7-77e9f84edf98'
  }

  const connectEnvOverrides = isDev ? devEnvOverridesConnect : {}

  const checkoutEnvOverrides = isDev ? devEnvOverridesCheckout : {}

  return (
    <ThemeProvider theme="dark">
      <SequenceConnect config={config} envOverrides={connectEnvOverrides}>
        <SequenceWalletProvider>
          <SequenceCheckoutProvider envOverrides={checkoutEnvOverrides}>
            <Homepage />
          </SequenceCheckoutProvider>
        </SequenceWalletProvider>
      </SequenceConnect>
    </ThemeProvider>
  )
}
