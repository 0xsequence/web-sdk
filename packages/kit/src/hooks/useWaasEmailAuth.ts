import { SequenceWaaS } from '@0xsequence/waas'
import { useState } from 'react'
import { ExtendedConnector } from '../utils'

export function useEmailAuth({ connector, onSuccess }: { connector?: ExtendedConnector; onSuccess: (idToken: string) => void }) {
  if (!connector) {
    return {
      inProgress: false,
      loading: false,
      error: undefined,
      initiateAuth: async (email: string) => {},
      sendChallengeAnswer: async (answer: string) => {}
    }
  }

  const [email, setEmail] = useState('')
  const [error, setError] = useState<unknown>()
  const [loading, setLoading] = useState(false)
  const [instance, setInstance] = useState('')

  const initiateAuth = async (email: string) => {
    setLoading(true)

    try {
      const connectorAny: any = connector
      const { instance } = await connectorAny.sequenceWaas?.email.initiateAuth({ email })
      setInstance(instance)
      setEmail(email)
    } catch (e: any) {
      setError(e.message || 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  const sendChallengeAnswer = async (answer: string) => {
    setLoading(true)

    try {
      const connectorAny: any = connector
      const sessionHash = await connectorAny.sequenceWaas?.getSessionHash()
      const { idToken } = await connectorAny.sequenceWaas?.email.finalizeAuth({ instance, answer, email, sessionHash })
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
