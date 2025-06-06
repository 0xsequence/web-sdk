import { useEffect } from 'react'
import { useConnect } from 'wagmi'

import { LocalStorageKey } from '../../constants/localStorage.js'
import { useStorage } from '../../hooks/useStorage.js'
import type { ExtendedConnector } from '../../types.js'

// EpicAuthProvider handles Epic Games OAuth login redirects.
// On mount, it checks the URL for Epic login results, stores the Epic JWT in storage, and triggers a connection with the Epic connector if found.
export const EpicAuthProvider = ({ children }: { children: React.ReactNode }) => {
  const { connectors, connect } = useConnect()
  const storage = useStorage()

  const socialAuthConnectors = (connectors as ExtendedConnector[])
    .filter(c => c._wallet?.type === 'social')
    .filter(c => !c._wallet.id.includes('email'))

  // UseEffect to handle the redirect back from the worker for Epic login
  useEffect(() => {
    const hash = window.location.hash
    const searchParams = new URLSearchParams(window.location.search)
    const loginError = searchParams.get('epic_login_error')

    // Check for errors first
    if (loginError) {
      console.log(`Epic Login Failed: ${loginError}`)
      // Clear the error query parameters from the URL
      window.history.replaceState(null, '', window.location.pathname + window.location.hash)
    }
    // Handle successful login via hash
    if (hash.startsWith('#epic_jwt=')) {
      const epicJwt = hash.substring('#epic_jwt='.length)
      // Clear the hash from the URL
      window.history.replaceState(null, '', window.location.pathname + window.location.search)
      const signInWithEpic = async (token: string) => {
        try {
          storage?.setItem(LocalStorageKey.WaasEpicIdToken, token)
          connect({ connector: socialAuthConnectors.find(c => c._wallet.id === 'epic-waas')! })
        } catch (err) {
          console.error('Sequence WaaS sign in failed:', err)
        }
      }
      signInWithEpic(epicJwt)
    }
  }, [])

  return <>{children}</>
}
