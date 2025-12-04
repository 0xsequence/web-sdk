import { SequenceWaaS, type SignInResponse } from '@0xsequence/waas'
import { useState } from 'react'

import { randomName } from '../connectors/wagmiConnectors/index.js'
import type { ExtendedConnector } from '../types.js'

interface SuccessResultV1 {
  version: 1
  idToken: string
}

interface SuccessResultV2 {
  version: 2
  signInResponse: SignInResponse
}

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
        setError(err as Error)
      })

    setLoading(false)
  }

  const sendChallengeAnswer = async (answer: string) => {
    setLoading(true)
    setError(undefined)

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
