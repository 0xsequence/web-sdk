import React from 'react'
import { Box, Button, Placeholder, SendIcon, Text } from '@0xsequence/design-system'

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
        paddingX="4"
        paddingTop="0"
        style={{
          marginTop: '-20px'
        }}
      >
        <Box gap="3" alignItems="center" justifyContent="center" flexDirection="column">
          <Placeholder style={{ width: '120px', height: '30px' }} />
          <Placeholder style={{ width: '140px', height: '40px' }} />
        </Box>
        <Box>
          <Placeholder style={{ width: '347px', height: '347px' }} />
        </Box>
        <Box>
          {/* balance */}
          <Box>
            <Text fontWeight="medium" color="text50" fontSize="normal">
              Balance
            </Text>
            <Box flexDirection="row" alignItems="flex-end" justifyContent="space-between">
              <Placeholder style={{ width: '44px', height: '36px' }} />
              <Placeholder style={{ width: '34px', height: '17px' }} />
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
