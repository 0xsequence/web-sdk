import { Box, Spinner, Text } from '@0xsequence/design-system'
import { Transaction } from '@0xsequence/indexer'
import React, { useMemo } from 'react'

import { TransactionHistoryItem } from './TransactionHistoryItem'
import { TransactionHistorySkeleton } from './TransactionHistorySkeleton'

interface TransactionHistoryListProps {
  transactions: Transaction[]
  isPending: boolean
  isFetchingNextPage: boolean
}

export const TransactionHistoryList = ({ transactions, isPending, isFetchingNextPage }: TransactionHistoryListProps) => {
  type TransactionPeriodId = 'today' | 'yesterday' | 'week' | 'month' | 'year' | 'years'

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
      label: 'Last Week'
    },
    {
      id: 'month',
      label: 'Last Month'
    },
    {
      id: 'year',
      label: 'Last Year'
    },
    {
      id: 'years',
      label: 'Past Years'
    }
  ]

  const transactionsByTime = useMemo(() => {
    const todayTreshold = new Date(new Date().setHours(0, 0, 0, 0)).getTime()
    const yesterdayTreshold = new Date(new Date().setDate(new Date(todayTreshold).getDate() - 1)).getTime()
    const weekTreshold = new Date(new Date().setDate(new Date().getDate() - 7)).getTime()
    const monthTreshold = new Date(new Date().setDate(new Date().getDate() - 30)).getTime()
    const yearTreshold = new Date(new Date().setDate(new Date().getDate() - 365)).getTime()

    const transactionsByTime: {
      [key in TransactionPeriodId]: Transaction[]
    } = {
      today: [],
      yesterday: [],
      week: [],
      month: [],
      year: [],
      years: []
    }

    transactions.forEach(transaction => {
      const transactionTime = new Date(transaction.timestamp).getTime()
      if (transactionTime > todayTreshold) {
        transactionsByTime.today.push(transaction)
      } else if (transactionTime > yesterdayTreshold) {
        transactionsByTime.yesterday.push(transaction)
      } else if (transactionTime > weekTreshold) {
        transactionsByTime.week.push(transaction)
      } else if (transactionTime > monthTreshold) {
        transactionsByTime.month.push(transaction)
      } else if (transactionTime > yearTreshold) {
        transactionsByTime.year.push(transaction)
      } else {
        transactionsByTime.years.push(transaction)
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
