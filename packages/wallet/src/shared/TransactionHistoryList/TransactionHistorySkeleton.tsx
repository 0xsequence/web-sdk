import React from 'react'
import { Text, Box, Placeholder } from '@0xsequence/design-system'

export const TransactionHistorySkeleton = () => {
  const getTransactionItem = () => {
    return (
      <Box flexDirection="column" gap="2" width="full" justifyContent="space-between">
        <Box flexDirection="row" justifyContent="space-between">
          <Placeholder style={{ width: '65px', height: '20px' }} />
          <Placeholder style={{ width: '75px', height: '17px' }} />
        </Box>
        <Box flexDirection="row" justifyContent="space-between">
          <Placeholder style={{ width: '120px', height: '20px' }} />
          <Placeholder style={{ width: '35px', height: '17px' }} />
        </Box>
      </Box>
    )
  }

  return (
    <Box flexDirection="column" gap="3">
      <Placeholder style={{ width: '70px', height: '17px' }} />
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
