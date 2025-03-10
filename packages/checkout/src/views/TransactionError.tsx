import { CloseIcon, Text } from '@0xsequence/design-system'
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
    <div style={{ height: '650px' }}>
      <div
        className="flex flex-col items-center absolute"
        style={{ top: '50%', right: '50%', transform: 'translate(50%, -50%)' }}
      >
        <NotificationErrorIcon />
        <Text variant="xlarge">Error</Text>
        <Text className="text-center" variant="normal" color="secondary">
          An error occurred while processing the transaction.
        </Text>
      </div>
    </div>
  )
}

export const NotificationErrorIcon = () => (
  <div className="flex text-white items-center justify-center w-16 h-16 rounded-full mb-2 bg-negative">
    <CloseIcon size="xl" />
  </div>
)
