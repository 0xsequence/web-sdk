import { CheckmarkIcon, Text } from '@0xsequence/design-system'
import { ChainId, allNetworks } from '@0xsequence/network'
import React, { useEffect } from 'react'

import { TransactionSuccessNavigation } from '../contexts'
import { useCheckoutModal, useNavigation } from '../hooks'

export const TransactionSuccess = () => {
  const { settings } = useCheckoutModal()
  const nav = useNavigation()
  const navigation = nav.navigation as TransactionSuccessNavigation

  const chainId = settings?.creditCardCheckout?.chainId || ChainId.POLYGON
  const network = allNetworks.find(n => n.chainId === chainId)

  useEffect(() => {
    settings?.creditCardCheckout?.onSuccess &&
      settings?.creditCardCheckout?.onSuccess(navigation.params.transactionHash, settings?.creditCardCheckout)
  }, [])

  return (
    <div style={{ height: '650px' }}>
      <div
        className="flex flex-col items-center absolute"
        style={{ top: '50%', right: '50%', transform: 'translate(50%, -50%)' }}
      >
        <NotificationSuccessIcon />
        <Text variant="xlarge">Success!</Text>
        <Text className="text-center" variant="normal" color="secondary">
          Purchase was successful, item was sent to your wallet.
        </Text>
        {navigation.params.transactionHash && (
          <Text className="mt-6" variant="small" underline color="primary" asChild>
            <a
              href={`${network?.blockExplorer?.rootUrl}/tx/${navigation.params.transactionHash}`}
              target="_blank"
              rel="noreferrer"
            >
              View on {network?.blockExplorer?.name}
            </a>
          </Text>
        )}
      </div>
    </div>
  )
}

export const NotificationSuccessIcon = () => (
  <div className="flex text-white bg-positive items-center justify-center w-16 h-16 rounded-full mb-2">
    <CheckmarkIcon size="xl" />
  </div>
)
