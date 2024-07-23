import { SequenceWaaS } from '@0xsequence/waas'
import { useState } from 'react'

import { ExtendedConnector } from '../types'

export function useEmailAuth({ connector, onSuccess }: { connector?: ExtendedConnector; onSuccess: (idToken: string) => void }) {
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
  const [error, setError] = useState<unknown>()
  const [loading, setLoading] = useState(false)
  const [instance, setInstance] = useState('')

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

    try {
      const { instance } = await waas.email.initiateAuth({ email })
      setInstance(instance)
      setEmail(email)
    } catch (e: any) {
      setError(e.message || 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  const sendChallengeAnswer = async (answer: string) => {
    const waas = getSequenceWaas()

    setLoading(true)

    try {
      const sessionHash = await waas.getSessionHash()
      const { idToken } = await waas.email.finalizeAuth({ instance, answer, email, sessionHash })
      onSuccess(idToken)
    } catch (e: any) {
      setError(e.message || 'Unknown error')
      setLoading(false)
    }
  }

  return {
    inProgress: loading || !!instance,
    loading,
    error,
    initiateAuth,
    sendChallengeAnswer: instance ? sendChallengeAnswer : undefined
  }
}
