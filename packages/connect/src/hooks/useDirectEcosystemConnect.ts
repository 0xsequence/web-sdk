import { useConnect } from 'wagmi'

import { EcosystemConnector } from '../connectors/ecosystem/ecosystemWallet'

export const useDirectEcosystemConnect = () => {
  const { connectors, connect } = useConnect()

  const triggerConnect = async (auxData?: Record<string, unknown>) => {
    const ecosystemConnector = connectors.find(
      (connector): connector is EcosystemConnector => connector.type === 'ecosystem-wallet'
    )

    if (!ecosystemConnector) {
      throw new Error('Ecosystem wallet connector not found')
    }

    if (auxData) {
      ecosystemConnector.auxData = auxData
    }

    return connect({ connector: ecosystemConnector })
  }

  return triggerConnect
}
