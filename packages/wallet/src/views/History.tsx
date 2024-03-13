import { Box, vars } from '@0xsequence/design-system'
import React from 'react'
import { useAccount } from 'wagmi'

import { SCROLLBAR_WIDTH } from '../constants'
import { useSettings, useTransactionHistorySummary } from '../hooks'
import { TransactionHistoryList } from '../shared/TransactionHistoryList'

export const History = () => {
  const { selectedNetworks } = useSettings()
  const { address: accountAddress } = useAccount()

  const { data: transactionHistory = [], isLoading: isLoadingTransactionHistory } = useTransactionHistorySummary({
    accountAddress: accountAddress || '',
    chainIds: selectedNetworks
  })

  return (
    <Box>
      <Box paddingX="4" paddingBottom="5" paddingTop="3">
        <TransactionHistoryList
          transactions={transactionHistory}
          isLoading={isLoadingTransactionHistory}
          isFetchingNextPage={false}
        />
      </Box>
    </Box>
  )
}
