import { Box, Spinner, Text } from '@0xsequence/design-system'
import { Transaction } from '@0xsequence/indexer'
import { useMemo } from 'react'

import { TransactionHistoryItem } from './TransactionHistoryItem'
import { TransactionHistorySkeleton } from './TransactionHistorySkeleton'

interface TransactionHistoryListProps {
  transactions: Transaction[]
  isPending: boolean
  isFetchingNextPage: boolean
}

export const TransactionHistoryList = ({ transactions, isPending, isFetchingNextPage }: TransactionHistoryListProps) => {
  type TransactionPeriodId = 'today' | 'yesterday' | 'week' | 'month' | 'year' | 'past'

  interface TransactionPeriods {
    id: TransactionPeriodId
    label: string
  }

  const transactionPeriods: TransactionPeriods[] = [
    {
      id: 'today',
      label: 'Today'
    },
    {
      id: 'yesterday',
      label: 'Yesterday'
    },
    {
      id: 'week',
      label: 'This Week'
    },
    {
      id: 'month',
      label: 'This Month'
    },
    {
      id: 'year',
      label: 'This Year'
    },
    {
      id: 'past',
      label: 'Past'
    }
  ]

  const transactionsByTime = useMemo(() => {
    const todayThreshold = new Date(new Date().setHours(0, 0, 0, 0)).getTime()
    const yesterdayThreshold = new Date(new Date().setDate(new Date(todayThreshold).getDate() - 1)).getTime()

    const currentDate = new Date(new Date().setHours(0, 0, 0, 0))
    const firstDayOfWeek = new Date(currentDate.setDate(currentDate.getDate() - currentDate.getDay()))
    const firstDayOfMonth = new Date(currentDate.setDate(1))
    const firstDayOfYear = new Date(currentDate.setMonth(0, 1))

    const weekThreshold = firstDayOfWeek.getTime()
    const monthThreshold = firstDayOfMonth.getTime()
    const yearThreshold = firstDayOfYear.getTime()

    const transactionsByTime: {
      [key in TransactionPeriodId]: Transaction[]
    } = {
      today: [],
      yesterday: [],
      week: [],
      month: [],
      year: [],
      past: []
    }

    transactions.forEach(transaction => {
      const transactionTime = new Date(transaction.timestamp).getTime()
      if (transactionTime >= todayThreshold) {
        transactionsByTime.today.push(transaction)
      } else if (transactionTime >= yesterdayThreshold) {
        transactionsByTime.yesterday.push(transaction)
      } else if (transactionTime >= weekThreshold) {
        transactionsByTime.week.push(transaction)
      } else if (transactionTime >= monthThreshold) {
        transactionsByTime.month.push(transaction)
      } else if (transactionTime >= yearThreshold) {
        transactionsByTime.year.push(transaction)
      } else {
        transactionsByTime.past.push(transaction)
      }
    })

    return transactionsByTime
  }, [transactions])

  if (isPending) {
    return (
      <Box flexDirection="column" gap="2">
        <TransactionHistorySkeleton />
      </Box>
    )
  }

  interface TimeLabelProps {
    label: string
  }

  const TimeLabel = ({ label }: TimeLabelProps) => {
    return (
      <Box>
        <Text variant="normal" color="text50" fontWeight="medium">
          {label}
        </Text>
      </Box>
    )
  }

  interface TransactionsListProps {
    transactions: Transaction[]
  }

  const TransactionsList = ({ transactions }: TransactionsListProps) => {
    return (
      <Box flexDirection="column" gap="2">
        {transactions.map((transaction, index) => {
          return (
            <Box key={`${transaction.txnHash}-${index}`} flexDirection="column" gap="2">
              <TransactionHistoryItem transaction={transaction} />
            </Box>
          )
        })}
      </Box>
    )
  }

  return (
    <Box flexDirection="column" gap="5">
      {transactionPeriods.map(period => {
        const txs = transactionsByTime[period.id]
        if (txs.length === 0) {
          return null
        }
        return (
          <Box key={period.id} flexDirection="column" gap="3">
            <TimeLabel label={period.label} />
            <TransactionsList transactions={txs} />
          </Box>
        )
      })}
      {transactions.length === 0 && (
        <Box flexDirection="column" gap="3">
          <TimeLabel label={'History'} />
          <Text color="text100">No Recent Transaction History Found</Text>
        </Box>
      )}
      {isFetchingNextPage && (
        <Box margin="4" alignItems="center" justifyContent="center">
          <Spinner />
        </Box>
      )}
    </Box>
  )
}
