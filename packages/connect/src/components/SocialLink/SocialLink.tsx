import { Button, Card, Divider, PINCodeInput, Spinner, Text, TextInput } from '@0xsequence/design-system'
import { type Account } from '@0xsequence/waas'
import { GoogleLogin, type CredentialResponse } from '@react-oauth/google'
import { useEffect, useRef, useState, type SetStateAction } from 'react'
import AppleSignin from 'react-apple-signin-auth'
import { english } from 'viem/accounts'

import { LocalStorageKey } from '../../constants/localStorage.js'
import { useSequenceWaaS } from '../../hooks/useSequenceWaaS.js'
import { useStorageItem } from '../../hooks/useStorage.js'
import { isAccountAlreadyLinkedError, useEmailAuth } from '../../utils/useEmailAuth.js'

import { AccountName } from './AccountName.js'

export function SocialLink() {
  const [linkErrorMessage, setLinkErrorMessage] = useState<string | null>(null)
  const [currentAccount, setCurrentAccount] = useState<Account>()
  const [accounts, setAccounts] = useState<Account[]>()
  const [loading, setLoading] = useState<boolean>(true)

  const [error, setError] = useState<string>()

  const [email, setEmail] = useState('')
  const inputRef = useRef<HTMLInputElement | null>(null)
  const isEmailValid = inputRef.current?.validity.valid
  const [showEmailWarning, setEmailWarning] = useState(false)
  const [code, setCode] = useState<string[]>([])

  const sequenceWaaS = useSequenceWaaS()
  const { data: googleClientId } = useStorageItem(LocalStorageKey.WaasGoogleClientID)
  const { data: appleClientId } = useStorageItem(LocalStorageKey.WaasAppleClientID)

  const {
    inProgress: emailAuthInProgress,
    loading: emailAuthLoading,
    initiateAuth: initiateEmailAuth,
    sendChallengeAnswer
  } = useEmailAuth({
    sessionName: randomName(),
    onSuccess: async () => {
      await refreshAccounts()
    },
    linkAccount: true
  })

  const refreshAccounts = async () => {
    const response = await sequenceWaaS.listAccounts()
    setAccounts(response.accounts)
    if (response.currentAccountId) {
      setCurrentAccount(response.accounts.find(account => account.id === response.currentAccountId))
    }
    window.dispatchEvent(new CustomEvent('sequence:waas-accounts-updated'))
  }

  const removeAccount = async (id: string) => {
    setLoading(true)
    setAccounts(undefined)
    try {
      await sequenceWaaS.removeAccount(id)
      await refreshAccounts()
    } catch (e: unknown) {
      setError(getMessageFromUnknownError(e))
      await refreshAccounts()
    }

    setLoading(false)
  }

  const handleGoogleLogin = async (tokenResponse: CredentialResponse) => {
    const challenge = await sequenceWaaS.initAuth({ idToken: tokenResponse.credential! })

    setLinkErrorMessage(null)
    try {
      await sequenceWaaS.linkAccount(challenge)
      await refreshAccounts()
    } catch (e) {
      if (isAccountAlreadyLinkedError(e)) {
        setLinkErrorMessage('This account is already linked to another wallet')
      }
    }
  }

  const appleRedirectUri = 'https://' + window.location.host
  const handleAppleLogin = async (response: { authorization: { id_token: string } }) => {
    const challenge = await sequenceWaaS.initAuth({ idToken: response.authorization.id_token })

    setLinkErrorMessage(null)
    try {
      await sequenceWaaS.linkAccount(challenge)
      await refreshAccounts()
    } catch (e) {
      if (isAccountAlreadyLinkedError(e)) {
        setLinkErrorMessage('This account is already linked to another wallet')
      }
    }
  }

  useEffect(() => {
    refreshAccounts()
      .then(() => setLoading(false))
      .catch((e: unknown) => {
        setError(getMessageFromUnknownError(e))
        setLoading(false)
      })
  }, [emailAuthInProgress])

  return (
    <div className="p-4 flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Text variant="normal" color="text100" fontWeight="bold">
          Linked accounts
        </Text>
        <Text variant="small" color="text80">
          Manage the sign-in methods connected to this wallet. Remove any you no longer use.
        </Text>
      </div>

      <Card className="p-4">
        <div className="flex flex-col gap-3">
          <Text variant="small" color="text80" fontWeight="medium">
            Connected logins
          </Text>
          {loading && <Spinner />}
          {!loading && accounts && accounts.length === 0 && (
            <Text variant="small" color="text80">
              No accounts linked yet. Add one below to secure your wallet.
            </Text>
          )}
          {!loading &&
            accounts?.map(a => (
              <div
                key={a.id}
                className="flex flex-row items-center gap-2 justify-between border border-border-normal rounded-md px-3 py-2"
              >
                <div className="flex flex-col">
                  <Text variant="normal" color="text100">
                    <AccountName acc={a} />
                  </Text>
                  {a.id === currentAccount?.id && (
                    <Text variant="small" color="text80">
                      Currently signed in
                    </Text>
                  )}
                </div>
                {a.id !== currentAccount?.id && <Button size="xs" label="Remove" onClick={() => removeAccount(a.id)} />}
              </div>
            ))}
          {error && (
            <Text variant="small" color="negative" fontWeight="medium">
              Error loading accounts: {error}
            </Text>
          )}
        </div>
      </Card>

      <Divider />

      <div className="flex flex-col gap-2 w-full">
        <Text variant="large" color="text100" fontWeight="bold" className="mb-2">
          Link another login method
        </Text>
        <Text variant="small" color="text80">
          Add a backup sign-in option to make sure you can always access your wallet.
        </Text>

        <div className="flex flex-col w-fit gap-2 mt-2">
          {googleClientId && <GoogleLogin onSuccess={handleGoogleLogin} shape="circle" width="100%" />}
          {appleClientId && (
            // @ts-ignore
            <AppleSignin
              authOptions={{
                clientId: appleClientId,
                scope: 'openid email',
                redirectURI: appleRedirectUri,
                usePopup: true
              }}
              onError={(error: unknown) => console.error(error)}
              onSuccess={handleAppleLogin}
              uiType="dark"
            />
          )}
        </div>

        {linkErrorMessage && (
          <Text variant="normal" color="negative" fontWeight="bold">
            {linkErrorMessage}
          </Text>
        )}

        <Divider />

        <div className="mt-2">
          <Text variant="normal" color="text100" fontWeight="bold">
            Email
          </Text>
        </div>

        {sendChallengeAnswer ? (
          <div className="flex flex-col">
            <div className="mt-3">
              <Text className="mt-5" variant="normal" color="text80">
                Enter the 6-digit code we emailed you.
              </Text>
            </div>
            <div className="mt-4">
              <PINCodeInput value={code} digits={6} onChange={setCode} />
            </div>

            <div className="flex gap-2 my-4 items-center">
              {emailAuthLoading ? (
                <Spinner />
              ) : (
                <Button
                  variant="primary"
                  disabled={code.includes('')}
                  label="Verify"
                  onClick={() => sendChallengeAnswer(code.join(''))}
                  data-id="verifyButton"
                />
              )}
            </div>
          </div>
        ) : (
          <div className="mb-4">
            <Text variant="normal" color="text80">
              Use an email to add a recovery login. We&apos;ll send a one-time code to verify.
            </Text>

            <div className="mt-6">
              <TextInput
                name="email"
                type="email"
                onChange={(ev: { target: { value: SetStateAction<string> } }) => {
                  setLinkErrorMessage(null)
                  setEmail(ev.target.value)
                }}
                ref={inputRef}
                onKeyDown={(ev: { key: string }) => {
                  if (email && ev.key === 'Enter') {
                    setLinkErrorMessage(null)
                    initiateEmailAuth(email)
                  }
                }}
                onBlur={() => setEmailWarning(!!email && !isEmailValid)}
                value={email}
                placeholder="hello@example.com"
                required
                data-id="loginEmail"
              />
              {showEmailWarning && (
                <Text variant="small" color="negative" className="my-2 text-red-500">
                  Invalid email address
                </Text>
              )}
            </div>
            <div className="flex gap-2 my-4 items-center justify-start">
              {emailAuthLoading ? (
                <Spinner />
              ) : (
                <Button
                  variant="primary"
                  disabled={!isEmailValid}
                  label="Continue"
                  onClick={() => initiateEmailAuth(email)}
                  data-id="continueButton"
                />
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

const DEVICE_EMOJIS = [
  // 256 emojis for unsigned byte range 0 - 255
  ...'🐶🐱🐭🐹🐰🦊🐻🐼🐨🐯🦁🐮🐷🐽🐸🐵🙈🙉🙊🐒🐔🐧🐦🐤🐣🐥🦆🦅🦉🦇🐺🐗🐴🦄🐝🐛🦋🐌🐞🐜🦟🦗🕷🕸🦂🐢🐍🦎🦖🦕🐙🦑🦐🦞🦀🐡🐠🐟🐬🐳🐋🦈🐊🐅🐆🦓🦍🦧🐘🦛🦏🐪🐫🦒🦘🐃🐂🐄🐎🐖🐏🐑🦙🐐🦌🐕🐩🦮🐈🐓🦃🦚🦜🦢🦩🕊🐇🦝🦨🦡🦦🦥🐁🐀🐿🦔🐾🐉🐲🌵🎄🌲🌳🌴🌱🌿🍀🎍🎋🍃👣🍂🍁🍄🐚🌾💐🌷🌹🥀🌺🌸🌼🌻🌞🌝🍏🍎🍐🍊🍋🍌🍉🍇🍓🍈🥭🍍🥥🥝🍅🥑🥦🥬🥒🌶🌽🥕🧄🧅🥔🍠🥐🥯🍞🥖🥨🧀🥚🍳🧈🥞🧇🥓🥩🍗🍖🦴🌭🍔🍟🍕🥪🥙🧆🌮🌯🥗🥘🥫🍝🍜🍲🍛🍣🍱🥟🦪🍤🍙🍚🍘🍥🥠🥮🍢🍡🍧🍨🍦🥧🧁🍰🎂🍮🍭🍬🍫🍿🍩🍪🌰🥜👀👂👃👄👅👆👇👈👉👊👋👌👍👎👏👐👑👒👓🎯🎰🎱🎲🎳👾👯👺👻👽🏂🏃🏄'
]

function randomName() {
  const wordlistSize = english.length
  const words = english

  const randomEmoji = DEVICE_EMOJIS[Math.floor(Math.random() * DEVICE_EMOJIS.length)]
  const randomWord1 = words[Math.floor(Math.random() * wordlistSize)]
  const randomWord2 = words[Math.floor(Math.random() * wordlistSize)]

  return `${randomEmoji} ${randomWord1} ${randomWord2}`
}

function getMessageFromUnknownError(e: unknown) {
  if (e && typeof e === 'object' && 'message' in e && e.message && typeof e.message === 'string') {
    return e.message
  }
  return 'unknown error'
}
