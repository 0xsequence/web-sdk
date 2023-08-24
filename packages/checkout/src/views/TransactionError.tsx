import React, { useEffect } from 'react'
import { Box, CloseIcon, Text } from '@0xsequence/design-system'

import { useCheckoutModal, useNavigation } from '../hooks'
import { TransactionErrorNavigation } from '../contexts'

export const TransactionError = () => {
  const { closeCheckout, settings } = useCheckoutModal()
  const nav = useNavigation()
  const navigation = nav.navigation as TransactionErrorNavigation

  useEffect(() => {
    setTimeout(() => {
      closeCheckout && closeCheckout()
      settings?.onError && settings.onError(navigation.params.error)
    }, 3000)
  }, [])

  return (
    <Box style={{ height: '500px' }}>
      <Box
        flexDirection="column"
        alignItems="center"
        position="absolute"
        style={{top: '50%', right: '50%', transform: 'translate(50%, -50%)'}}
      >
        <NotificationErrorIcon />
        <Text fontSize="xlarge">Error</Text>
        <Text textAlign="center" variant="normal" color="text80">
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
