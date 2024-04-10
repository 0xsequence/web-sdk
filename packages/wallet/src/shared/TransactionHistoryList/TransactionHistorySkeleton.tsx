import React from 'react'
import { Text, Box } from '@0xsequence/design-system'

import { Skeleton } from '../../shared/Skeleton'

export const TransactionHistorySkeleton = () => {
  const getTransactionItem = () => {
    return (
      <Box flexDirection="column" gap="2" width="full" justifyContent="space-between">
        <Box flexDirection="row" justifyContent="space-between">
          <Skeleton width="65px" height="20px" />
          <Skeleton width="75px" height="17px" />
        </Box>
        <Box flexDirection="row" justifyContent="space-between">
          <Skeleton width="120px" height="20px" />
          <Skeleton width="35px" height="17px" />
        </Box>
      </Box>
    )
  }

  return (
    <Box flexDirection="column" gap="3">
      <Skeleton width="70px" height="17px" />
      <Box flexDirection="column" gap="2">
        {Array(8)
          .fill(null)
          .map((_, index) => {
            return (
              <Box
                borderRadius="md"
                padding="4"
                gap="2"
                alignItems="center"
                justifyContent="center"
                flexDirection="column"
                background="backgroundSecondary"
                key={index}
              >
                {getTransactionItem()}
              </Box>
            )
          })}
      </Box>
    </Box>
  )
}
