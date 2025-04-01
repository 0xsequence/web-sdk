import { SequenceWaaS, SignInResponse } from '@0xsequence/waas'
import { useState } from 'react'

// import { EmailWaasOptions } from '../connectors/email/emailWaas'
import { randomName } from '../connectors/wagmiConnectors'
import { ExtendedConnector } from '../types'

interface SuccessResultV1 {
  version: 1
  idToken: string
}

interface SuccessResultV2 {
  version: 2
  signInResponse: SignInResponse
}

/**
 * Hook to handle email-based authentication flow for WaaS (Wallet-as-a-Service).
 *
 * This hook manages the complete email authentication process, including:
 * - Initiating email authentication
 * - Handling verification code submission
 * - Managing loading and error states
 * - Supporting both v1 (idToken) and v2 (SignInResponse) authentication formats
 *
 * @param {ExtendedConnector} [params.connector] - The WaaS connector to use for authentication.
 *        Optional because the user might not have selected a connector yet.
 * @param {Function} params.onSuccess - Callback function called when authentication succeeds.
 *        Receives either a v1 result (with idToken) or v2 result (with SignInResponse).
 *
 * @returns {Object} An object containing:
 * - `inProgress` - Whether authentication is currently in progress
 * - `loading` - Whether a specific authentication operation is loading
 * - `error` - Any error that occurred during authentication
 * - `initiateAuth` - Function to start the email authentication process
 * - `sendChallengeAnswer` - Function to submit the verification code
 * - `cancel` - Function to cancel the authentication process
 * - `resetError` - Function to clear any error state
 *
 * @example
 * ```tsx
 * const {
 *   inProgress,
 *   loading,
 *   error,
 *   initiateAuth,
 *   sendChallengeAnswer,
 *   resetError
 * } = useEmailAuth({
 *   connector: emailConnector,
 *   onSuccess: async (result) => {
 *     if ('signInResponse' in result) {
 *       // Handle v2 authentication
 *       await storage.setItem('email', result.signInResponse.email)
 *     } else {
 *       // Handle v1 authentication
 *       await storage.setItem('idToken', result.idToken)
 *     }
 *   }
 * })
 * ```
 */
export function useEmailAuth({
  connector,
  onSuccess
}: {
  connector?: ExtendedConnector
  onSuccess: (result: SuccessResultV1 | SuccessResultV2) => void
}) {
  const [_email, setEmail] = useState('')
  const [error, setError] = useState<Error | undefined>()
  const [loading, setLoading] = useState(false)
  const [instance, _setInstance] = useState('')
  const [respondWithCode, setRespondWithCode] = useState<((code: string) => Promise<void>) | null>()

  if (!connector) {
    return {
      inProgress: false,
      loading: false,
      error: undefined,
      initiateAuth: async (_email: string) => {},
      sendChallengeAnswer: async (_answer: string) => {},
      resetError: () => {}
    }
  }

  const getSequenceWaas = () => {
    if (!connector) {
      throw new Error('Connector is not defined')
    }

    const sequenceWaas: SequenceWaaS | undefined = (connector as any).sequenceWaas

    if (!sequenceWaas) {
      throw new Error('Connector does not support SequenceWaaS')
    }

    return sequenceWaas
  }

  const initiateAuth = async (email: string) => {
    // const params = (connector as any).params as EmailWaasOptions
    const waas = getSequenceWaas()

    setLoading(true)
    setError(undefined)

    waas.onEmailAuthCodeRequired(async respondWithCode => {
      setRespondWithCode(() => respondWithCode)
    })

    waas
      .signIn({ email }, randomName())
      .then(signInResponse => {
        onSuccess({ version: 2, signInResponse })

        if (signInResponse.email) {
          setEmail(signInResponse.email)
        }
      })
      .catch(err => {
        setError(err)
      })

    setLoading(false)
  }

  const sendChallengeAnswer = async (answer: string) => {
    // const params = (connector as any).params as EmailWaasOptions
    // const waas = getSequenceWaas()

    setLoading(true)
    setError(undefined)

    // version 2
    if (!respondWithCode) {
      throw new Error('Email v2 auth, respondWithCode is not defined')
    }

    try {
      await respondWithCode(answer)
    } catch (err: any) {
      setError(err)
    } finally {
      setLoading(false)
    }
  }

  const cancel = () => {
    setLoading(false)
    setRespondWithCode(null)
    setError(undefined)
  }

  const resetError = () => {
    setError(undefined)
  }

  return {
    inProgress: loading || !!instance,
    loading,
    error,
    initiateAuth,
    sendChallengeAnswer,
    cancel,
    resetError
  }
}
