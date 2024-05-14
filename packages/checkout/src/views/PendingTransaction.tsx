import { Box } from '@0xsequence/design-system'
import { useProjectAccessKey } from '@0xsequence/kit'
import React, { useEffect } from 'react'

import { fetchSardineOrderStatus } from '../api'
import { TransactionPendingNavigation } from '../contexts'
import { useNavigation, useCheckoutModal } from '../hooks'

const POLLING_TIME = 10 * 1000

export const PendingTransaction = () => {
  const nav = useNavigation()
  const { settings } = useCheckoutModal()
  const {
    params: { authToken, orderId }
  } = nav.navigation as TransactionPendingNavigation
  const { setNavigation } = nav
  const projectAccessKey = useProjectAccessKey()

  const isDev = settings?.creditCardCheckout?.isDev || false
  const url = isDev
    ? `https://crypto.sandbox.sardine.ai/?client_token=${authToken}&show_features=true`
    : `https://crypto.sardine.ai/?client_token=${authToken}&show_features=true`

  const pollForOrderStatus = async () => {
    try {
      console.log('Polling for transaction status')
      const isDev = settings?.creditCardCheckout?.isDev || false

      const pollResponse = await fetchSardineOrderStatus(orderId, isDev, projectAccessKey)
      const status = pollResponse.resp.status
      const transactionHash = pollResponse.resp?.transactionHash

      console.log('transaction status poll response:', status)

      if (status === 'Draft') {
        return
      }
      if (status === 'Complete') {
        setNavigation &&
          setNavigation({
            location: 'transaction-success',
            params: {
              transactionHash
            }
          })
        return
      }
      if (status === 'Declined' || status === 'Cancelled') {
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
            error: e as Error
          }
        })
    }
  }

  useEffect(() => {
    const interval = setInterval(() => {
      pollForOrderStatus()
    }, POLLING_TIME)

    return () => {
      clearInterval(interval)
    }
  }, [])

  return (
    <Box alignItems="center" justifyContent="center" style={{ height: '620px' }}>
      <iframe
        src={url}
        style={{
          maxHeight: '500px',
          height: '100%',
          maxWidth: '380px',
          width: '100%'
        }}
      />
    </Box>
  )
}
