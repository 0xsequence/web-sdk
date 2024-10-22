import { Box, CloseIcon, Text } from '@0xsequence/design-system'
import React, { useEffect } from 'react'

import { TransactionErrorNavigation } from '../contexts'
import { useCheckoutModal, useNavigation } from '../hooks'

export const TransactionError = () => {
  const { closeCheckout, settings } = useCheckoutModal()
  const nav = useNavigation()
  const navigation = nav.navigation as TransactionErrorNavigation

  useEffect(() => {
    setTimeout(() => {
      closeCheckout()
      settings?.creditCardCheckout?.onError &&
        settings?.creditCardCheckout?.onError(navigation.params.error, settings?.creditCardCheckout)
    }, 3000)
  }, [])

  return (
    <Box style={{ height: '650px' }}>
      <Box
        flexDirection="column"
        alignItems="center"
        position="absolute"
        style={{ top: '50%', right: '50%', transform: 'translate(50%, -50%)' }}
      >
        <NotificationErrorIcon />
        <Text variant="xlarge">Error</Text>
        <Text variant="normal" textAlign="center" color="text80">
          An error occurred while processing the transaction.
        </Text>
      </Box>
    </Box>
  )
}

export const NotificationErrorIcon = () => (
  <Box
    color="white"
    alignItems="center"
    justifyContent="center"
    width="16"
    height="16"
    borderRadius="circle"
    marginBottom="2"
    background="negative"
  >
    <CloseIcon size="xl" />
  </Box>
)
