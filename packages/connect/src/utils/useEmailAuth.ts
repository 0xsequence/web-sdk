import { Challenge } from '@0xsequence/waas'
import { useEffect, useState } from 'react'

import { useSequenceWaaS } from '../hooks/useSequenceWaaS.js'

export function useEmailAuth({
  onSuccess,
  sessionName,
  linkAccount = false
}: {
  onSuccess: (res: { wallet: string; sessionId: string }) => void
  sessionName: string
  linkAccount?: boolean
}) {
  const [error, setError] = useState<unknown>()
  const [loading, setLoading] = useState(false)
  const [inProgress, setInProgress] = useState(false)
  const [respondWithCode, setRespondWithCode] = useState<((code: string) => Promise<void>) | null>()

  const [challenge, setChallenge] = useState<Challenge | undefined>()

  const sequenceWaaS = useSequenceWaaS()

  useEffect(() => {
    return sequenceWaaS.onEmailAuthCodeRequired(async respondWithCode => {
      setLoading(false)
      setRespondWithCode(() => respondWithCode)
    })
  }, [sequenceWaaS, setLoading, setRespondWithCode])

  const initiateAuth = async (email: string) => {
    setLoading(true)
    setInProgress(true)
    try {
      if (linkAccount) {
        const challenge = await sequenceWaaS.initAuth({ email })
        setChallenge(challenge)
        setLoading(false)
      } else {
        const res = await sequenceWaaS.signIn({ email }, sessionName)
        onSuccess(res)
      }
    } catch (e: unknown) {
      setError(JSON.stringify(e))
    } finally {
      if (!linkAccount) {
        setLoading(false)
        setInProgress(false)
      }
    }
  }

  const sendChallengeAnswer = async (answer: string) => {
    if (linkAccount && challenge) {
      //completeAuth(challenge.withAnswer(answer), { sessionName })
      try {
        await sequenceWaaS.linkAccount(challenge.withAnswer(answer))
      } catch (e) {
        if (isAccountAlreadyLinkedError(e)) {
          setError('This account is already linked to another wallet')
        }
      }
      setLoading(false)
      setInProgress(false)
      return
    }
    if (respondWithCode) {
      await respondWithCode(answer)
    }
  }

  const cancel = () => {
    setInProgress(false)
    setLoading(false)
    setChallenge(undefined)
    setRespondWithCode(null)
  }

  return {
    inProgress,
    initiateAuth,
    loading,
    error,
    sendChallengeAnswer: inProgress ? sendChallengeAnswer : undefined,
    cancel
  }
}

export const isAccountAlreadyLinkedError = (e: unknown) => {
  if (e && typeof e === 'object' && 'name' in e) {
    return e.name === 'AccountAlreadyLinked'
  }
  return false
}
