import { TrailsWidget } from '0xtrails'
import { useConfig } from '@0xsequence/hooks'
import { useAccount } from 'wagmi'

import { TRAILS_CUSTOM_CSS } from '../Swap/consts.js'
import {
  getEnvironmentFromApiUrl,
  sequenceApiURL,
  sequenceIndexerURL,
  sequenceNodeGatewayURL,
  trailsApiURL
} from '../Swap/utils.js'

export const Buy = () => {
  const { address } = useAccount()
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
      mode="fund"
      toAddress={address || null}
      customCss={TRAILS_CUSTOM_CSS}
      hideDisconnect={true}
      hideAddWallet={true}
    />
  )
}
