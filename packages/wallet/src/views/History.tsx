import { Box } from '@0xsequence/design-system'
import { useAccount } from 'wagmi'

import { useSettings } from '../hooks'
import { TransactionHistoryList } from '../shared/TransactionHistoryList'

import { useGetTransactionHistorySummary } from '@0xsequence/react-hooks'

export const History = () => {
  const { selectedNetworks } = useSettings()
  const { address: accountAddress } = useAccount()

  const { data: transactionHistory = [], isPending: isPendingTransactionHistory } = useGetTransactionHistorySummary(
    {
      filter: {
        accountAddress: accountAddress || ''
      }
    },
    selectedNetworks
  )

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
