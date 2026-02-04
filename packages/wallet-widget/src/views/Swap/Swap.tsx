import { TrailsWidget } from '0xtrails/widget'
import { useConfig } from '@0xsequence/hooks'

import { TRAILS_CUSTOM_CSS } from './constants.js'
import { getEnvironmentFromApiUrl, sequenceApiURL, sequenceIndexerURL, sequenceNodeGatewayURL, trailsApiURL } from './utils.js'

export const Swap = () => {
  const config = useConfig()

  // Determine environment from config
  const environment = getEnvironmentFromApiUrl(config.env.apiUrl)

  // Generate all required URLs
  const trailsApiUrl = trailsApiURL(environment)
  const sequenceIndexerUrl = sequenceIndexerURL(environment)
  const sequenceNodeGatewayUrl = sequenceNodeGatewayURL(environment)
  const sequenceApiUrl = sequenceApiURL(environment)

  return (
    <TrailsWidget
      apiKey={config.projectAccessKey}
      trailsApiUrl={trailsApiUrl}
      sequenceIndexerUrl={sequenceIndexerUrl}
      sequenceNodeGatewayUrl={sequenceNodeGatewayUrl}
      appUrl="https://sequence.app"
      sequenceApiUrl={sequenceApiUrl}
      renderInline={true}
      theme="dark"
      mode="swap"
      customCss={TRAILS_CUSTOM_CSS}
    />
  )
}
