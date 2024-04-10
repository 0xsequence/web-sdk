import React, { useState } from 'react'
import { Box, Text } from '@0xsequence/design-system'
import { useCheckoutModal } from '../hooks/useCheckoutModal'
import { PaperTransaction } from '../shared/components/PaperTransaction'
import { HEADER_HEIGHT } from '../constants'

export const PaperTransactionForm = () => {
  const { settings } = useCheckoutModal()

  return (
    <Box
      paddingX="4"
      paddingBottom="8"
      gap="4"
      flexDirection="column"
      style={{
        marginTop: HEADER_HEIGHT
      }}
    >
      {settings && <PaperTransaction settings={settings} />}
    </Box>
  )
}
