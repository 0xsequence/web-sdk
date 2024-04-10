import React, { useState, useEffect, ChangeEvent } from 'react'
import { Box, Button, Card, Spinner, Text, TextInput, EditIcon, CheckmarkIcon } from '@0xsequence/design-system'
import { CheckoutWithCard } from '@paperxyz/react-client-sdk'
import { useNavigation } from '../../hooks'
import { fetchPaperSecret } from '../../api'
import { CheckoutSettings } from '../../contexts/CheckoutModal'
export interface PaperTransactionProps {
  settings: CheckoutSettings
}

export const PaperTransaction = ({ settings }: PaperTransactionProps) => {
  const [emailEditState, setEmailEditState] = useState(true)
  const [email, setEmail] = useState<string>(settings.creditCardCheckout?.email || '')
  const [inputEmailAddress, setInputEmailAddress] = useState<string | undefined>(email)
  const [paperSecret, setPaperSecret] = useState<string | null>(null)
  const [paperSecretLoading, setPaperSecretLoading] = useState(false)
  const { setNavigation } = useNavigation()

  const onClickEditEmail = () => {
    if (emailEditState) {
      setEmail(inputEmailAddress || '')
    }
    if (!emailEditState) {
      setInputEmailAddress(email)
    }
    setEmailEditState(!emailEditState)
  }

  const fetchSecret = async () => {
    setPaperSecretLoading(true)
    try {
      if (!email) {
        throw 'No email address found'
      }

      if (!settings.creditCardCheckout) {
        throw 'No credit card checkout settings found'
      }

      const secret = await fetchPaperSecret({
        email,
        ...settings.creditCardCheckout
      })

      setPaperSecret(secret)
    } catch (e) {
      console.error('Failed to fetch paper secret', e)
      setNavigation({
        location: 'transaction-error',
        params: {
          error: e
        }
      })
    }
    setPaperSecretLoading(false)
  }

  useEffect(() => {
    const timer = setInterval(() => {
      // This is a workaround for the KYC modal not becoming clickable
      // The alternative of using the onReview callback does not work due
      // to race conditions
      const paperJsSdkModal = document.getElementById('paper-js-sdk-modal')
      if (paperJsSdkModal) {
        paperJsSdkModal.style.pointerEvents = 'visible'
      }
    }, 100)
    return () => {
      clearInterval(timer)
    }
  }, [])

  useEffect(() => {
    if (email !== '') {
      fetchSecret()
    }
  }, [email])

  const isValidEmailAddress = () => {
    const emailRegEx = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,})+$/
    const isValidEmail = emailRegEx.test(inputEmailAddress || '')
    return isValidEmail
  }

  const emailAddressOnChange = (ev: ChangeEvent<HTMLInputElement>) => {
    setInputEmailAddress(ev.target.value)
  }

  const onPending = (transactionId: string) => {
    setNavigation({
      location: 'transaction-pending',
      params: {
        transactionId
      }
    })
  }

  const onError = (error: Error) => {
    setNavigation({
      location: 'transaction-error',
      params: {
        error
      }
    })
  }

  const getEmailInput = () => {
    if (emailEditState) {
      return (
        <Box as="form" flexDirection="row" justifyContent="space-between" alignItems="flex-start" onSubmit={onClickEditEmail}>
          <Box flexDirection="column" justifyContent="center" alignItems="flex-start" gap="2">
            <Text fontSize="normal" fontWeight="normal" color="text50">
              Receipt email address
            </Text>
            <TextInput
              autoFocus
              name="email"
              type="email"
              placeholder="Email Address"
              value={inputEmailAddress}
              onChange={emailAddressOnChange}
              data-1p-ignore
            />
          </Box>
          <Button size="xs" label={'Save'} leftIcon={CheckmarkIcon} disabled={!isValidEmailAddress()} type="submit" />
        </Box>
      )
    }

    return (
      <Box flexDirection="row" justifyContent="space-between" alignItems="flex-start">
        <Box flexDirection="column" justifyContent="center" alignItems="flex-start" gap="2">
          <Text fontSize="normal" fontWeight="normal" color="text50">
            Receipt email address
          </Text>
          <Text fontSize="normal" fontWeight="bold" color="text100">
            {email}
          </Text>
        </Box>
        <Button size="xs" label={'Edit'} leftIcon={EditIcon} onClick={onClickEditEmail} />
      </Box>
    )
  }

  return (
    <Box>
      {getEmailInput()}
      {paperSecretLoading && (
        <Box
          width="full"
          height="full"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          style={{ height: '200px' }}
        >
          <Spinner size="lg" style={{ width: '60px', height: '60px' }} />
        </Box>
      )}
      {paperSecret && !paperSecretLoading && (
        <Card marginY="4" flexDirection="column">
          <CheckoutWithCard
            sdkClientSecret={paperSecret}
            appName={settings?.creditCardCheckout?.receiptTitle}
            onReview={() => {}}
            onPaymentSuccess={result => {
              // @ts-ignore-next-line
              onPending(result.id)
            }}
            onError={error => {
              console.error('Payment error:', error)
              onError(error.error)
            }}
            options={{
              // colorBackground: '#cce3de',
              colorPrimary: '#447dd1',
              colorText: '#ffffff',
              borderRadius: 12
            }}
          />
        </Card>
      )}
    </Box>
  )
}
