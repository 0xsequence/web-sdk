import { Box, Button, SendIcon, Skeleton, Text } from '@0xsequence/design-system'
import React from 'react'

import { HEADER_HEIGHT } from '../../constants'
import { TransactionHistorySkeleton } from '../../shared/TransactionHistoryList/TransactionHistorySkeleton'

export const CollectibleDetailsSkeleton = () => {
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
          <Skeleton style={{ width: '120px', height: '30px' }} />
          <Skeleton style={{ width: '140px', height: '40px' }} />
        </Box>
        <Box>
          <Skeleton style={{ width: '347px', height: '347px' }} />
        </Box>
        <Box>
          {/* balance */}
          <Box>
            <Text variant="normal" fontWeight="medium" color="text50">
              Balance
            </Text>
            <Box flexDirection="row" alignItems="flex-end" justifyContent="space-between">
              <Skeleton style={{ width: '44px', height: '36px' }} />
              <Skeleton style={{ width: '34px', height: '17px' }} />
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
          <Text variant="normal" color="text50" fontWeight="medium">
            This week
          </Text>
          <TransactionHistorySkeleton />
        </Box>
      </Box>
    </Box>
  )
}
