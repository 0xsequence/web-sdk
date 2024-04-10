import React, { useEffect } from 'react'
import { Box, CheckmarkIcon, Text } from '@0xsequence/design-system'

import { useCheckoutModal, useNavigation } from '../hooks'
import { TransactionSuccessNavigation } from '../contexts'

export const TransactionSuccess = () => {
  const { closeCheckout, settings } = useCheckoutModal()
  const nav = useNavigation()
  const navigation = nav.navigation as TransactionSuccessNavigation

  useEffect(() => {
    setTimeout(() => {
      closeCheckout()
      settings?.creditCardCheckout?.onSuccess && settings?.creditCardCheckout?.onSuccess(navigation.params.transactionHash)
    }, 3000)
  }, [])

  return (
    <Box style={{ height: '500px' }}>
      <Box
        flexDirection="column"
        alignItems="center"
        position="absolute"
        style={{ top: '50%', right: '50%', transform: 'translate(50%, -50%)' }}
      >
        <NotificationSuccessIcon />
        <Text fontSize="xlarge">Success!</Text>
        <Text textAlign="center" variant="normal" color="text80">
          The transaction was successful.
        </Text>
      </Box>
    </Box>
  )
}

export const NotificationSuccessIcon = () => (
  <Box
    color="white"
    background="positive"
    alignItems="center"
    justifyContent="center"
    width="16"
    height="16"
    borderRadius="circle"
    marginBottom="2"
  >
    <CheckmarkIcon size="xl" />
  </Box>
)
