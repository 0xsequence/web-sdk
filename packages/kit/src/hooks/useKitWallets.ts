import { type UseConnectionsReturnType, useAccount, useConnect, useConnections, useDisconnect } from 'wagmi'

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

  const wallets: KitWallet[] = connections.map((connection: UseConnectionsReturnType[number]) => ({
    id: connection.connector.id,
    name: (connection.connector._wallet as any)?.name ?? connection.connector.name,
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

    try {
      await disconnectAsync({ connector: connection.connector })
    } catch (error) {
      console.error('Failed to disconnect wallet:', error)
    }
  }

  return {
    wallets,
    setActiveWallet,
    disconnectWallet
  }
}
