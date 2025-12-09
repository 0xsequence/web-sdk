'use client'

import { Modal, ModalPrimitive, Spinner } from '@0xsequence/design-system'
import { useEffect, type ReactNode } from 'react'
import { useAccount, useConnect } from 'wagmi'

import { EpicLogo } from '../../connectors/epic/EpicLogo.js'
import { LocalStorageKey } from '../../constants/localStorage.js'
import { useStorage } from '../../hooks/useStorage.js'
import type { ExtendedConnector } from '../../types.js'

// Handles Epic Games OAuth redirects for WaaS by capturing the Epic JWT and triggering a reconnect.
export const EpicAuthProvider = ({ children }: { children: ReactNode }) => {
  const { connectors, connect, isPending } = useConnect()
  const { isConnected } = useAccount()

  const storage = useStorage()

  const socialAuthConnectors = (connectors as ExtendedConnector[])
    .filter(c => c._wallet?.type === 'social')
    .filter(c => !c._wallet.id.includes('email'))

  useEffect(() => {
    const hash = window.location.hash
    const searchParams = new URLSearchParams(window.location.search)
    const loginError = searchParams.get('epic_login_error')

    if (loginError) {
      console.log(`Epic Login Failed: ${loginError}`)
      window.history.replaceState(null, '', window.location.pathname + window.location.hash)
    }

    if (hash.startsWith('#epic_jwt=')) {
      const epicJwt = hash.substring('#epic_jwt='.length)
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

  return (
    <>
      {isPending && !isConnected && (
        <Modal size="sm" scroll={false} isDismissible={false} contentProps={{ style: { maxWidth: '320px', padding: '20px' } }}>
          <div className="flex flex-col items-center text-black rounded-lg">
            <div className="w-12 h-12 mb-4" aria-label="Epic Games">
              <EpicLogo />
            </div>
            <ModalPrimitive.Title asChild>
              <div className="flex items-center gap-4 mt-4 mb-2 flex-row">
                <h2 className="text-white text-lg font-semibold text-center w-full">Logging in with Epic Games…</h2>
                <Spinner />
              </div>
            </ModalPrimitive.Title>
          </div>
        </Modal>
      )}
      {children}
    </>
  )
}
