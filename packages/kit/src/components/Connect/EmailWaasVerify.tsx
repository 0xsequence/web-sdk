import { Box, Button, CheckmarkIcon, PINCodeInput, Spinner, Text } from '@0xsequence/design-system'
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

  return (
    <>
      <Box paddingY="6" gap="4" alignItems="center" justifyContent="center" flexDirection="column">
        <Text marginTop="5" variant="normal" color="text80">
          Enter code received in email.
        </Text>
        <Box ref={inputRef}>
          <PINCodeInput value={waasEmailPinCode} digits={6} group={3} onChange={setWaasEmailPinCode} disabled={isLoading} />
        </Box>

        <Box justifyContent="center" alignItems="center" position="relative" width="full" gap="1">
          <Text variant="small" color="text80">
            Didn't receive an email?{' '}
          </Text>
          {showSentEmail && (
            <Box flexDirection="row" alignItems="center" justifyContent="center" gap="2">
              <Text variant="small" fontWeight="bold" color="text50">
                Email sent!
              </Text>
              <CheckmarkIcon color="positive" size="sm" style={{ marginLeft: '-4px' }} />
            </Box>
          )}
          {!showSentEmail && (
            <Box position="relative" flexDirection="row" alignItems="center" justifyContent="center" gap="2">
              <Button
                variant="text"
                onClick={onClickResend}
                disabled={isLoadingSendCode}
                label="Resend email"
                style={{ marginLeft: '-6px' }}
              />
              {isLoadingSendCode && <Spinner size="sm" position="absolute" style={{ top: '0px', right: '-18px' }} />}
            </Box>
          )}
        </Box>
        {isErrorSendCode && (
          <Text variant="small" color="negative" textAlign="center">
            An error occurred while sending the email
          </Text>
        )}

        <Box gap="4" alignItems="center" justifyContent="center" flexDirection="column">
          <Button
            variant="primary"
            disabled={!isPinCodeValid || isLoading || isLoadingSendCode}
            label="Confirm"
            onClick={() => onConfirm(waasEmailPinCode.join(''))}
            data-id="verifyButton"
          />

          {isLoading && <Spinner />}

          {error && (
            <Text variant="small" color="negative" textAlign="center">
              {error.message}
            </Text>
          )}
        </Box>
      </Box>
    </>
  )
}
