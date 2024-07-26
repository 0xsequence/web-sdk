import { SequenceWaaS, SignInResponse } from '@0xsequence/waas'
import { useState } from 'react'

import { EmailWaasOptions } from '../connectors/email/emailWaas'
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

export function useEmailAuth({
  connector,
  onSuccess
}: {
  connector?: ExtendedConnector
  onSuccess: (result: SuccessResultV1 | SuccessResultV2) => void
}) {
  if (!connector) {
    return {
      inProgress: false,
      loading: false,
      error: undefined,
      initiateAuth: async (_email: string) => {},
      sendChallengeAnswer: async (_answer: string) => {}
    }
  }

  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | undefined>()
  const [loading, setLoading] = useState(false)
  const [instance, setInstance] = useState('')
  const [respondWithCode, setRespondWithCode] = useState<((code: string) => Promise<void>) | null>()

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
    const params = (connector as any).params as EmailWaasOptions
    const waas = getSequenceWaas()

    setLoading(true)
    setError(undefined)

    if (params.emailAuthVersion === 1) {
      try {
        const { instance } = await waas.email.initiateAuth({ email })
        setInstance(instance)
        setEmail(email)
      } catch (e: any) {
        setError(e.message || 'Unknown error')
      } finally {
        setLoading(false)
      }
    } else {
      waas.onEmailAuthCodeRequired(async respondWithCode => {
        console.log('email auth code required')
        setRespondWithCode(() => respondWithCode)
      })

      waas
        .signIn({ email }, randomName())
        .then(res => {
          console.log('email auth version 2 success', res)
          onSuccess({ version: 2, signInResponse: res })

          if (res.email) {
            setEmail(res.email)
          }
        })
        .catch(e => {
          console.log('email auth version 2 error', e)
          setError(e.message || 'Unknown error')
        })

      setLoading(false)
    }
  }

  const sendChallengeAnswer = async (answer: string) => {
    const params = (connector as any).params as EmailWaasOptions
    const waas = getSequenceWaas()

    setLoading(true)
    setError(undefined)

    if (params.emailAuthVersion === 1) {
      // version 1
      try {
        const sessionHash = await waas.getSessionHash()
        const { idToken } = await waas.email.finalizeAuth({ instance, answer, email, sessionHash })

        onSuccess({ version: 1, idToken })
      } catch (e: any) {
        setError(e.message || 'Unknown error')
      } finally {
        setLoading(false)
      }
    } else {
      // version 2
      if (!respondWithCode) {
        throw new Error('Email v2 auth, respondWithCode is not defined')
      }

      try {
        await respondWithCode(answer)
      } catch (e: any) {
        setError(e.message || 'Unknown error')
      } finally {
        setLoading(false)
      }
    }
  }

  const cancel = () => {
    setLoading(false)
    setRespondWithCode(null)
  }

  return {
    inProgress: loading || !!instance,
    loading,
    error,
    initiateAuth,
    sendChallengeAnswer,
    cancel
  }
}
