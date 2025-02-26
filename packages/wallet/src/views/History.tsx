import { useAccount } from 'wagmi'

import { useSettings } from '../hooks'
import { TransactionHistoryList } from '../shared/TransactionHistoryList'

import { Box } from '@0xsequence/design-system'
import { useGetTransactionHistorySummary } from '@0xsequence/kit-hooks'

export const History = () => {
  const { selectedNetworks } = useSettings()
  const { address: accountAddress } = useAccount()

  const { data: transactionHistory = [], isPending: isPendingTransactionHistory } =
    useGetTransactionHistorySummary({
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
