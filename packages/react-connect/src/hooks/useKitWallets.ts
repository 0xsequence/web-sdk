import { Connector, type UseConnectionsReturnType, useAccount, useConnect, useConnections, useDisconnect } from 'wagmi'

import { SEQUENCE_UNIVERSAL_CONNECTOR_NAME } from '../components/Connect/Connect'
import { ExtendedConnector } from '../types'

import { useLinkedWallets } from './data'
import { useWaasGetLinkedWalletsSignature } from './useWaasGetLinkedWalletsSignature'

export interface KitWallet {
  id: string
  name: string
  address: string
  isActive: boolean
  isEmbedded: boolean
}

export const useKitWallets = () => {
  const { address } = useAccount()
  const connections = useConnections()
  const { connectAsync } = useConnect()
  const { disconnectAsync } = useDisconnect()

  const waasConnection = connections.find(c => (c.connector as ExtendedConnector)?.type === 'sequence-waas')

  const {
    message: linkedWalletsMessage,
    signature: linkedWalletsSignature,
    address: linkedWalletsWaasAddress,
    chainId: linkedWalletsSigChainId
  } = useWaasGetLinkedWalletsSignature(waasConnection)

  // Only fetch if we have valid data
  const hasValidData = !!(linkedWalletsWaasAddress && linkedWalletsMessage && linkedWalletsSignature)

  const {
    data: linkedWallets,
    refetch: refetchLinkedWallets,
    clearCache: clearLinkedWalletsCache
  } = useLinkedWallets(
    {
      parentWalletAddress: linkedWalletsWaasAddress || '',
      parentWalletMessage: linkedWalletsMessage || '',
      parentWalletSignature: linkedWalletsSignature || '',
      signatureChainId: `${linkedWalletsSigChainId}`
    },
    {
      enabled: hasValidData
    }
  )

  const wallets: KitWallet[] = connections.map((connection: UseConnectionsReturnType[number]) => ({
    id: connection.connector.id,
    name: getConnectorName(connection.connector),
    address: connection.accounts[0],
    isActive: connection.accounts[0] === address,
    isEmbedded: connection.connector.id.includes('waas')
  }))

  const setActiveWallet = async (walletAddress: string) => {
    const connection = connections.find((c: UseConnectionsReturnType[number]) => c.accounts[0] === walletAddress)
    if (!connection) return

    try {
      await connectAsync({ connector: connection.connector })
    } catch (error) {
      console.error('Failed to set active wallet:', error)
    }
  }

  const disconnectWallet = async (walletAddress: string) => {
    const connection = connections.find((c: UseConnectionsReturnType[number]) => c.accounts[0] === walletAddress)
    if (!connection) return

    // invalidate linked wallets if we're disconnecting waas wallet
    if (connection.connector.id.includes('waas')) {
      clearLinkedWalletsCache()
    }

    try {
      await disconnectAsync({ connector: connection.connector })
    } catch (error) {
      console.error('Failed to disconnect wallet:', error)
    }
  }

  return {
    wallets,
    linkedWallets,
    setActiveWallet,
    disconnectWallet,
    refetchLinkedWallets
  }
}

const getConnectorName = (connector: Connector) => {
  const connectorName = connector.name
  const connectorWalletName = (connector._wallet as any)?.name

  if (connectorName === SEQUENCE_UNIVERSAL_CONNECTOR_NAME) {
    return 'Sequence Universal'
  }

  return connectorWalletName ?? connectorName
}
