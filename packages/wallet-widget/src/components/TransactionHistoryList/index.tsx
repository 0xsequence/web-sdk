import { Spinner, Text } from '@0xsequence/design-system'
import type { Transaction } from '@0xsequence/indexer'
import { useMemo } from 'react'

import { TransactionHistoryItem } from './TransactionHistoryItem.js'
import { TransactionHistorySkeleton } from './TransactionHistorySkeleton.js'

interface TransactionHistoryListProps {
  transactions: Transaction[]
  isLoading: boolean
  isFetchingNextPage: boolean
}

export const TransactionHistoryList = ({ transactions, isLoading, isFetchingNextPage }: TransactionHistoryListProps) => {
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

  if (isLoading) {
    return (
      <div className="flex flex-col gap-2">
        <TransactionHistorySkeleton />
      </div>
    )
  }

  interface TimeLabelProps {
    label: string
  }

  const TimeLabel = ({ label }: TimeLabelProps) => {
    return (
      <div>
        <Text variant="normal" color="muted" fontWeight="medium">
          {label}
        </Text>
      </div>
    )
  }

  interface TransactionsListProps {
    transactions: Transaction[]
  }

  const TransactionsList = ({ transactions }: TransactionsListProps) => {
    return (
      <div className="flex flex-col gap-2">
        {transactions.map((transaction, index) => {
          return (
            <div className="flex flex-col gap-2" key={`${transaction.txnHash}-${index}`}>
              <TransactionHistoryItem transaction={transaction} />
            </div>
          )
        })}
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-5">
      {transactionPeriods.map(period => {
        const txs = transactionsByTime[period.id]
        if (txs.length === 0) {
          return null
        }
        return (
          <div className="flex flex-col gap-3" key={period.id}>
            <TimeLabel label={period.label} />
            <TransactionsList transactions={txs} />
          </div>
        )
      })}
      {transactions.length === 0 && (
        <div className="flex flex-col gap-3">
          <TimeLabel label={'History'} />
          <Text color="primary">No Recent Transaction History Found</Text>
        </div>
      )}
      {isFetchingNextPage && (
        <div className="flex m-4 items-center justify-center">
          <Spinner />
        </div>
      )}
    </div>
  )
}
