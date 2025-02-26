import React, { useEffect } from 'react'

import { TransactionSuccessNavigation } from '../contexts'
import { useCheckoutModal, useNavigation } from '../hooks'

import { Box, CheckmarkIcon, Text } from '@0xsequence/design-system'
import { ChainId, allNetworks } from '@0xsequence/network'

export const TransactionSuccess = () => {
  const { settings } = useCheckoutModal()
  const nav = useNavigation()
  const navigation = nav.navigation as TransactionSuccessNavigation

  const chainId = settings?.creditCardCheckout?.chainId || ChainId.POLYGON
  const network = allNetworks.find(n => n.chainId === chainId)

  useEffect(() => {
    settings?.creditCardCheckout?.onSuccess &&
      settings?.creditCardCheckout?.onSuccess(navigation.params.transactionHash, settings?.creditCardCheckout)
    settings?.creditCardCheckout?.onSuccess &&
      settings?.creditCardCheckout?.onSuccess(navigation.params.transactionHash, settings?.creditCardCheckout)
  }, [])

  return (
    <Box style={{ height: '650px' }}>
      <Box
        flexDirection="column"
        alignItems="center"
        position="absolute"
        style={{ top: '50%', right: '50%', transform: 'translate(50%, -50%)' }}
      >
        <NotificationSuccessIcon />
        <Text variant="xlarge">Success!</Text>
        <Text variant="normal" textAlign="center" color="text80">
          Purchase was successful, item was sent to your wallet.
        </Text>
        {navigation.params.transactionHash && (
          <Text
            as="a"
            variant="small"
            underline
            marginTop="6"
            color="text100"
            href={`${network?.blockExplorer?.rootUrl}/tx/${navigation.params.transactionHash}`}
            target="_blank"
            rel="noreferrer"
          >
            View on {network?.blockExplorer?.name}
          </Text>
        )}
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
