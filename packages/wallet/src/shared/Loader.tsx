import React from 'react'
import { Box, Spinner } from '@0xsequence/design-system'

export const Loader = () => {
  return (
    <Box flexDirection="column" justifyContent="center" alignItems="center" gap="6" marginTop="4">
      <Box>
        <Spinner size="lg" />
      </Box>
    </Box>
  )
}
