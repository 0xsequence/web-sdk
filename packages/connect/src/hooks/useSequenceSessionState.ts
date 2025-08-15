import { DappClient } from '@0xsequence/dapp-client'
import type { Session } from '@0xsequence/dapp-client'
import { useEffect, useState } from 'react'
import { useConnections, type Connector } from 'wagmi'

interface SessionState {
  isInitialized: boolean
  walletAddress: `0x${string}` | null
  sessions: Session[]
  loginMethod: string | null
  userEmail: string | null
}

export function useSequenceSessionState() {
  const connections = useConnections()
  const v3Connector: Connector | undefined = connections.find((c: any) =>
    c.connector.id.includes('sequence-v3-wallet')
  )?.connector

  const dappClient = v3Connector?.client as DappClient | undefined

  const [session, setSession] = useState<SessionState>({
    isInitialized: dappClient?.isInitialized ?? false,
    walletAddress: dappClient?.getWalletAddress() ?? null,
    sessions: dappClient?.getAllSessions() ?? [],
    loginMethod: dappClient?.loginMethod ?? null,
    userEmail: dappClient?.userEmail ?? null
  })

  useEffect(() => {
    const handleSessionUpdate = () => {
      setSession({
        isInitialized: dappClient?.isInitialized ?? false,
        walletAddress: dappClient?.getWalletAddress() ?? null,
        sessions: dappClient?.getAllSessions() ?? [],
        loginMethod: dappClient?.loginMethod ?? null,
        userEmail: dappClient?.userEmail ?? null
      })
    }

    const unsubscribe = dappClient?.on('sessionsUpdated', handleSessionUpdate)

    // Perform an initial sync
    handleSessionUpdate()

    return () => {
      unsubscribe?.()
    }
  }, [dappClient])

  return session
}
