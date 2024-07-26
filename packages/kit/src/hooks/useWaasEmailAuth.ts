import { Challenge, SequenceWaaS, SignInResponse } from '@0xsequence/waas'
import { useState } from 'react'

import { EmailWaasOptions } from '../connectors/email/emailWaas'
import { ExtendedConnector } from '../types'
import { randomName } from '../connectors/wagmiConnectors'

export function useEmailAuth({
  connector,
  onSuccess,
  onEmailV2Success
}: {
  connector?: ExtendedConnector
  onSuccess: (idToken: string) => void
  onEmailV2Success: (signInResponse: SignInResponse) => void
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
  const [challenge, setChallenge] = useState<Challenge | undefined>()
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
          onEmailV2Success(res)
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
      try {
        const sessionHash = await waas.getSessionHash()
        const { idToken } = await waas.email.finalizeAuth({ instance, answer, email, sessionHash })
        onSuccess(idToken)
      } catch (e: any) {
        setError(e.message || 'Unknown error')
      } finally {
        setLoading(false)
      }
    } else {
      if (!respondWithCode) {
        throw new Error('Email v2 auth, respondWithCode is not defined')
      }

      respondWithCode(answer)
    }
  }

  const cancel = () => {
    setLoading(false)
    setChallenge(undefined)
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
