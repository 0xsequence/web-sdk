import { Button, CheckmarkIcon, PINCodeInput, Spinner, Text } from '@0xsequence/design-system';
import { useState, useEffect, useRef } from 'react'

interface EmailWaasVerifyProps {
  isLoading: boolean
  error?: Error
  onConfirm: (answer: string) => void
  resetError: () => void
  sendEmailCode: () => Promise<void>
}

const PIN_CODE_LENGTH = 6

export const EmailWaasVerify = (props: EmailWaasVerifyProps) => {
  const inputRef = useRef<HTMLInputElement>(null)
  const { isLoading, error, onConfirm } = props
  const [isLoadingSendCode, setIsLoadingSendCode] = useState(false)
  const [isErrorSendCode, setIsErrorSendCode] = useState(false)
  const [waasEmailPinCode, setWaasEmailPinCode] = useState<string[]>([])
  const [showSentEmail, setShowSentEmail] = useState(false)

  const isPinCodeValid = !waasEmailPinCode.includes('') && waasEmailPinCode.length === PIN_CODE_LENGTH

  useEffect(() => {
    props.resetError()
    if (isPinCodeValid) {
      onConfirm(waasEmailPinCode.join(''))
    }
  }, [waasEmailPinCode])

  useEffect(() => {
    if (inputRef.current) {
      const firstInput = inputRef.current?.childNodes?.[0]?.childNodes?.[0]

      if (firstInput) {
        ;(firstInput as HTMLInputElement)?.focus()
      }
    }
  }, [inputRef])

  const onClickResend = async () => {
    props.resetError()
    setIsErrorSendCode(false)
    setIsLoadingSendCode(true)
    try {
      await props.sendEmailCode()
      setShowSentEmail(true)
      setTimeout(() => {
        setShowSentEmail(false)
      }, 3000)
    } catch (e) {
      setIsErrorSendCode(true)
    }
    setIsLoadingSendCode(false)
  }

  return (<>
    <div className="flex py-6 gap-4 items-center justify-center flex-col">
      <Text className="mt-5" variant="normal" color="text80">
        Enter code received in email.
      </Text>
      <div ref={inputRef}>
        <PINCodeInput value={waasEmailPinCode} digits={6} group={3} onChange={setWaasEmailPinCode} disabled={isLoading} />
      </div>

      <div className="flex justify-center items-center relative w-full gap-1">
        <Text variant="small" color="text80">
          Didn't receive an email?{' '}
        </Text>
        {showSentEmail && (
          <div className="flex flex-row items-center justify-center gap-2">
            <Text variant="small" fontWeight="bold" color="text50">
              Email sent!
            </Text>
            <CheckmarkIcon className="text-positive" size="sm" style={{ marginLeft: '-4px' }} />
          </div>
        )}
        {!showSentEmail && (
          <div className="flex relative flex-row items-center justify-center gap-2">
            <Button
              variant="text"
              onClick={onClickResend}
              disabled={isLoadingSendCode}
              label="Resend email"
              style={{ marginLeft: '-6px' }}
            />
            {isLoadingSendCode && <Spinner className="absolute" size="sm" style={{ top: '0px', right: '-18px' }} />}
          </div>
        )}
      </div>
      {isErrorSendCode && (
        <Text className="text-center" variant="small" color="negative">
          An error occurred while sending the email
        </Text>
      )}

      <div className="flex gap-4 items-center justify-center flex-col">
        <Button
          variant="primary"
          disabled={!isPinCodeValid || isLoading || isLoadingSendCode}
          label="Confirm"
          onClick={() => onConfirm(waasEmailPinCode.join(''))}
          data-id="verifyButton"
        />

        {isLoading && <Spinner />}

        {error && (
          <Text className="text-center" variant="small" color="negative">
            {error.message}
          </Text>
        )}
      </div>
    </div>
  </>);
}
