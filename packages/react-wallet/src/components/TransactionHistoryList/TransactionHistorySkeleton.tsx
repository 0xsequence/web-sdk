import { Skeleton } from '@0xsequence/design-system'
import React from 'react'

export const TransactionHistorySkeleton = () => {
  const getTransactionItem = () => {
    return (
      <div className="flex flex-col gap-2 w-full justify-between">
        <div className="flex flex-row justify-between">
          <Skeleton style={{ width: '65px', height: '20px' }} />
          <Skeleton style={{ width: '75px', height: '17px' }} />
        </div>
        <div className="flex flex-row justify-between">
          <Skeleton style={{ width: '120px', height: '20px' }} />
          <Skeleton style={{ width: '35px', height: '17px' }} />
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      <Skeleton style={{ width: '70px', height: '17px' }} />
      <div className="flex flex-col gap-2">
        {Array(8)
          .fill(null)
          .map((_, index) => {
            return (
              <div className="flex rounded-xl p-4 gap-2 items-center justify-center flex-col bg-background-secondary" key={index}>
                {getTransactionItem()}
              </div>
            )
          })}
      </div>
    </div>
  )
}
