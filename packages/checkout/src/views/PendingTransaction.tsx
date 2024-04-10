import React, { useEffect } from 'react'
import { Box, Spinner, Text } from '@0xsequence/design-system'

import { useNavigation, useCheckoutModal } from '../hooks'
import { TransactionPendingNavigation } from '../contexts'

const POLLING_TIME = 10 * 1000

export const PendingTransaction = () => {
  const nav = useNavigation()
  const {
    params: { transactionId }
  } = nav.navigation as TransactionPendingNavigation
  const { setNavigation } = nav

  const paperGetStatusUrl = `https://withpaper.com/api/v1/transaction-status/${transactionId}`

  const pollForTxStatus = async () => {
    try {
      console.log('Polling for transaction status')
      const pollResponse = await fetch(paperGetStatusUrl, {
        method: 'GET',
        headers: {
          accept: 'application/json'
        }
      }).then(res => res.json())
      const status = pollResponse.result.status
      const transactionHash = pollResponse.result.transactionHash

      console.log('transaction status poll response:', status)

      if (status === 'PENDING') {
        return
      }
      if (status === 'TRANSFER_SUCCEEDED') {
        setNavigation &&
          setNavigation({
            location: 'transaction-success',
            params: {
              transactionHash
            }
          })
        return
      }
      if (status === 'TRANSFER_FAILED' || status === 'PAYMENT_FAILED') {
        setNavigation &&
          setNavigation({
            location: 'transaction-error',
            params: {
              error: new Error('Failed to transfer collectible')
            }
          })
        return
      }
    } catch (e) {
      console.error('An error occurred while fetching the transaction status')
      setNavigation &&
        setNavigation({
          location: 'transaction-error',
          params: {
            error: e
          }
        })
    }
  }

  useEffect(() => {
    const interval = setInterval(() => {
      pollForTxStatus()
    }, POLLING_TIME)

    return () => {
      clearInterval(interval)
    }
  }, [])

  return (
    <Box style={{ height: '500px' }}>
      <Box
        position="absolute"
        top="0"
        left="0"
        width="full"
        height="full"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
      >
        <Spinner size="lg" style={{ width: '60px', height: '60px' }} />
        <Text variant="medium" color="text50" textAlign="center" marginTop="8">
          Transaction in progress. <br />
          This may take a few minutes.
        </Text>
      </Box>
    </Box>
  )
}
