import { useGetTransactionHistorySummary } from '@0xsequence/web-sdk-hooks'
import React from 'react'
import { useAccount } from 'wagmi'

import { useSettings } from '../hooks'
import { TransactionHistoryList } from '../components/TransactionHistoryList'

export const History = () => {
  const { selectedNetworks } = useSettings()
  const { address: accountAddress } = useAccount()

  const { data: transactionHistory = [], isPending: isPendingTransactionHistory } = useGetTransactionHistorySummary({
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
