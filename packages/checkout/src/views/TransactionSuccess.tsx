import React, { useEffect } from 'react'
import { Box, CheckmarkIcon, Text } from '@0xsequence/design-system'

import { useCheckoutModal, useNavigation } from '../hooks'
import { TransactionSuccessNavigation } from '../contexts'
import { sequence } from '0xsequence'

export const TransactionSuccess = () => {
  const { closeCheckout, settings } = useCheckoutModal()
  const nav = useNavigation()
  const navigation = nav.navigation as TransactionSuccessNavigation

  const network = sequence.network.allNetworks.find(n => n.name === navigation.params.network)

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
          Purchase was successful, item was sent to your wallet.
        </Text>

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
