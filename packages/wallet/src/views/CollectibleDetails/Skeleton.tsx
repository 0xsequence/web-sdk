import React from 'react'
import { Box, Button, SendIcon, Text, vars } from '@0xsequence/design-system'

import { Skeleton } from '../../shared/Skeleton'
import { TransactionHistorySkeleton } from '../../shared/TransactionHistoryList/TransactionHistorySkeleton'

import { HEADER_HEIGHT } from '../../constants'
import { useScrollbarWidth } from '../../hooks/useScrollbarWidth'

export const CollectibleDetailsSkeleton = () => {
  const scrollbarWidth = useScrollbarWidth()

  return (
    <Box style={{ paddingTop: HEADER_HEIGHT }}>
      <Box
        flexDirection="column"
        gap="10"
        paddingBottom="5"
        paddingLeft="5"
        paddingTop="0"
        style={{
          marginTop: '-20px',
          paddingRight: `calc(${vars.space[5]} - ${scrollbarWidth})`
        }}
      >
        <Box gap="3" alignItems="center" justifyContent="center" flexDirection="column">
          <Skeleton width="120px" height="30px" />
          <Skeleton width="140px" height="40px" />
        </Box>
        <Box>
          <Skeleton width="347px" height="347px" />
        </Box>
        <Box>
          {/* balance */}
          <Box>
            <Text fontWeight="medium" color="text50" fontSize="normal">
              Balance
            </Text>
            <Box flexDirection="row" alignItems="flex-end" justifyContent="space-between">
              <Skeleton width="44px" height="36px" />
              <Skeleton width="34px" height="17px" />
            </Box>
          </Box>
          <Button
            color="text100"
            marginTop="4"
            width="full"
            variant="primary"
            leftIcon={SendIcon}
            label="Send"
            onClick={() => {}}
          />
        </Box>
        <Box>
          <Text fontSize="normal" color="text50" fontWeight="medium">
            This week
          </Text>
          <TransactionHistorySkeleton />
        </Box>
      </Box>
    </Box>
  )
}
