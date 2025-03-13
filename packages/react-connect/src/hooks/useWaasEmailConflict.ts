import { IdentityType, EmailConflictInfo, SequenceWaaS } from '@0xsequence/waas'
import { useEffect, useRef, useState } from 'react'
import { useConnect } from 'wagmi'

export type FormattedEmailConflictInfo = {
  email: string
  type: string
}

const accountTypeText = (info: EmailConflictInfo | null) => {
  if (!info) {
    return 'Unknown account type'
  }

  if (info.type === IdentityType.PlayFab) {
    return 'PlayFab login'
  }

  if (info.type === IdentityType.Email) {
    return 'Email login'
  }

  if (info.type === IdentityType.OIDC) {
    switch (info.issuer) {
      case 'https://accounts.google.com':
        return 'Google login'
      case 'https://appleid.apple.com':
        return 'Apple login'
      default:
        return 'Unknown account type'
    }
  }

  return info.type
}

export const useEmailConflict = () => {
  const { connectors } = useConnect()
  const forceCreateFuncRef = useRef<((forceCreate: boolean) => Promise<void>) | null>(null)
  const [isOpen, toggleModal] = useState(false)
  const [emailConflictInfo, setEmailConflictInfo] = useState<EmailConflictInfo | null>(null)

  const waasConnectors = connectors.filter(connector => !!(connector as any).sequenceWaas)
  const waasInstances = waasConnectors.map(connector => (connector as any).sequenceWaas as SequenceWaaS)

  useEffect(() => {
    if (waasInstances.length > 0) {
      // Set up listeners for all waas instances
      const disposers = waasInstances.map(waas =>
        waas.onEmailConflict(async (info, forceCreate) => {
          forceCreateFuncRef.current = forceCreate
          setEmailConflictInfo(info)
          toggleModal(true)
        })
      )

      // Return cleanup function that disposes all listeners
      return () => {
        disposers.forEach(disposer => disposer())
      }
    }
  }, [])

  return {
    toggleEmailConflictModal: toggleModal,
    isEmailConflictOpen: isOpen,
    emailConflictInfo: {
      email: emailConflictInfo?.email ?? 'Unknown',
      type: accountTypeText(emailConflictInfo)
    } as FormattedEmailConflictInfo,
    forceCreate: async () => {
      return forceCreateFuncRef.current?.(true)
    }
  }
}
