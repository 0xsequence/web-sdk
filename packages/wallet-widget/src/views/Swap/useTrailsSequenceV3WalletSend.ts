import type { ExtendedConnector } from '@0xsequence/connect'
import { useEffect } from 'react'
import { useConnection } from 'wagmi'

type SequenceV3ProviderWithWalletSendToggle = {
  setUseWalletTransactionForSend?: (enabled: boolean) => void
}

export const useTrailsSequenceV3WalletSend = () => {
  const { connector } = useConnection()

  useEffect(() => {
    const activeConnector = connector as ExtendedConnector | undefined
    if (activeConnector?.type !== 'sequence-v3-wallet' || typeof activeConnector.getProvider !== 'function') {
      return
    }

    let activeProvider: SequenceV3ProviderWithWalletSendToggle | undefined
    let cleanupRequested = false

    const setProviderMode = async (enabled: boolean) => {
      const provider = (await activeConnector.getProvider()) as SequenceV3ProviderWithWalletSendToggle
      if (cleanupRequested) {
        provider.setUseWalletTransactionForSend?.(false)
        return
      }
      activeProvider = provider
      provider.setUseWalletTransactionForSend?.(enabled)
    }

    void setProviderMode(true)

    return () => {
      cleanupRequested = true
      if (activeProvider) {
        activeProvider.setUseWalletTransactionForSend?.(false)
        return
      }
      void setProviderMode(false)
    }
  }, [connector])
}
