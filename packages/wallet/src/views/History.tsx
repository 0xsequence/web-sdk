import { Box } from '@0xsequence/design-system'
import React from 'react'
import { useAccount } from 'wagmi'

import { useSettings, useTransactionHistorySummary } from '../hooks'
import { TransactionHistoryList } from '../shared/TransactionHistoryList'
import { useScrollbarWidth } from '../hooks/useScrollbarWidth'

export const History = () => {
  const { selectedNetworks } = useSettings()
  const { address: accountAddress } = useAccount()
  const scrollbarWidth = useScrollbarWidth()

  const { data: transactionHistory = [], isPending: isPendingTransactionHistory } = useTransactionHistorySummary({
    accountAddress: accountAddress || '',
    chainIds: selectedNetworks
  })

  return (
    <Box>
      <Box paddingX="4" paddingBottom="5" paddingTop="3">
        <TransactionHistoryList
          transactions={transactionHistory}
          isPending={isPendingTransactionHistory}
          isFetchingNextPage={false}
        />
      </Box>
    </Box>
  )
}
