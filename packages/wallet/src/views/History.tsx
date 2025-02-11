import React from 'react'
import { useAccount } from 'wagmi'

import { useSettings, useTransactionHistorySummary } from '../hooks'
import { TransactionHistoryList } from '../shared/TransactionHistoryList'

export const History = () => {
  const { selectedNetworks } = useSettings()
  const { address: accountAddress } = useAccount()

  const { data: transactionHistory = [], isPending: isPendingTransactionHistory } = useTransactionHistorySummary({
    accountAddress: accountAddress || '',
    chainIds: selectedNetworks
  })

  return (
    <div>
      <div className="px-4 pb-5 pt-3">
        <TransactionHistoryList
          transactions={transactionHistory}
          isPending={isPendingTransactionHistory}
          isFetchingNextPage={false}
        />
      </div>
    </div>
  )
}
