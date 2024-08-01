import { Box, Button, PINCodeInput, Spinner, Text } from '@0xsequence/design-system'
import { useState } from 'react'

interface EmailWaasVerifyProps {
  isLoading: boolean
  error?: Error
  onConfirm: (answer: string) => void
}

export const EmailWaasVerify = (props: EmailWaasVerifyProps) => {
  const { isLoading, error, onConfirm } = props
  const [waasEmailPinCode, setWaasEmailPinCode] = useState<string[]>([])

  return (
    <>
      <Box paddingY="6" alignItems="center" justifyContent="center" flexDirection="column">
        <Text marginTop="5" marginBottom="4" variant="normal" color="text80">
          Enter code received in email.
        </Text>
        <PINCodeInput value={waasEmailPinCode} digits={6} group={3} onChange={setWaasEmailPinCode} disabled={isLoading} />

        <Box gap="4" marginTop="4" alignItems="center" justifyContent="center" flexDirection="column">
          <Button
            variant="primary"
            disabled={waasEmailPinCode.includes('') || isLoading}
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
