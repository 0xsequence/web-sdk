import { TrailsWidget } from '0xtrails'
import { useConnectConfigContext, useTheme } from '@0xsequence/connect'
import { useConfig } from '@0xsequence/hooks'

import { TRAILS_CUSTOM_CSS, TRAILS_CUSTOM_CSS_LIGHT } from './consts.js'
import { getEnvironmentFromApiUrl, sequenceApiURL, sequenceIndexerURL, sequenceNodeGatewayURL, trailsApiURL } from './utils.js'

export const Swap = () => {
  const config = useConfig()
  const { theme } = useTheme()
  const { trailsCustomCSS } = useConnectConfigContext()

  // Determine environment from config
  const environment = getEnvironmentFromApiUrl(config.env.apiUrl)

  // Generate all required URLs
  const trailsApiUrl = trailsApiURL(environment)
  const sequenceIndexerUrl = sequenceIndexerURL(environment)
  const sequenceNodeGatewayUrl = sequenceNodeGatewayURL(environment)
  const sequenceApiUrl = sequenceApiURL(environment)
  const trailsTheme = typeof theme === 'string' && theme === 'light' ? 'light' : 'dark'
  const resolvedCustomCss =
    typeof trailsCustomCSS === 'string'
      ? trailsCustomCSS
      : trailsCustomCSS?.[trailsTheme] || (trailsTheme === 'dark' ? TRAILS_CUSTOM_CSS : TRAILS_CUSTOM_CSS_LIGHT)

  return (
    <TrailsWidget
      apiKey={config.projectAccessKey}
      trailsApiUrl={trailsApiUrl}
      sequenceIndexerUrl={sequenceIndexerUrl}
      sequenceNodeGatewayUrl={sequenceNodeGatewayUrl}
      appUrl="https://sequence.app"
      sequenceApiUrl={sequenceApiUrl}
      renderInline={true}
      theme={trailsTheme}
      mode="swap"
      customCss={resolvedCustomCss}
      hideDisconnect={true}
      hideAddWallet={true}
    />
  )
}
