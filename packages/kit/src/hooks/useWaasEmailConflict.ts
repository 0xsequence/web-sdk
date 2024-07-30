import { EmailConflictInfo, SequenceWaaS } from '@0xsequence/waas'
import { useEffect, useRef, useState } from 'react'
import { useConnect } from 'wagmi'

export const useEmailConflict = () => {
  const { connectors } = useConnect()
  const forceCreateFuncRef = useRef<((forceCreate: boolean) => Promise<void>) | null>(null)
  const [isOpen, toggleModal] = useState(false)
  const [emailConflictInfo, setEmailConflictInfo] = useState<EmailConflictInfo | null>(null)

  const waasConnector = connectors.find(connector => !!(connector as any).sequenceWaas)
  const waas = (waasConnector as any)?.sequenceWaas as SequenceWaaS

  useEffect(() => {
    if (waas) {
      const disposer = waas.onEmailConflict(async (info, forceCreate) => {
        forceCreateFuncRef.current = forceCreate
        setEmailConflictInfo(info)
        toggleModal(true)
      })

      return disposer
    }
  }, [])

  return {
    toggleEmailConflictModal: toggleModal,
    isEmailConflictOpen: isOpen,
    emailConflictInfo,
    forceCreate: async () => {
      return forceCreateFuncRef.current?.(true)
    }
  }
}
