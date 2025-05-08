import { IdentityType, SequenceWaaS, type EmailConflictInfo } from '@0xsequence/waas'
import { useEffect, useRef, useState } from 'react'
import { useConnect } from 'wagmi'

/**
 * Represents formatted email conflict information returned by the hook.
 * This is a user-friendly version of the EmailConflictInfo from the WaaS service.
 */
export type FormattedEmailConflictInfo = {
  /** The email address that caused the conflict */
  email: string
  /** User-friendly description of the account type (e.g., 'Google login', 'Email login') */
  type: string
}

/**
 * Helper function to convert raw account type information into user-friendly text.
 *
 * @param info - The raw email conflict information from WaaS
 * @returns A user-friendly string describing the account type
 */
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

/**
 * Hook to handle email conflict detection and resolution for WaaS (Wallet-as-a-Service) authentication.
 *
 * This hook monitors all WaaS connectors for email conflicts that occur during sign-in attempts.
 * A conflict happens when a user tries to sign up with an email that's already associated with
 * a different authentication method (e.g., trying to use Google sign-in when the email was
 * previously used with Apple sign-in).
 *
 * @returns An object containing:
 * - `toggleEmailConflictModal` - Function to manually show/hide the conflict modal
 * - `isEmailConflictOpen` - Whether the conflict modal is currently open
 * - `emailConflictInfo` - Formatted information about the conflict (email and account type)
 * - `forceCreate` - Function to force create a new account despite the conflict
 *
 * @example
 * ```tsx
 * const {
 *   isEmailConflictOpen,
 *   emailConflictInfo,
 *   toggleEmailConflictModal
 * } = useEmailConflict()
 *
 * // When a conflict is detected
 * if (isEmailConflictOpen && emailConflictInfo) {
 *   console.log(
 *     `Email ${emailConflictInfo.email} is already used with ${emailConflictInfo.type}`
 *   )
 * }
 *
 * // Close the conflict modal
 * toggleEmailConflictModal(false)
 * ```
 */
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
