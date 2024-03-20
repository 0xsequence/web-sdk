import React from 'react'
import { Box } from '@0xsequence/design-system'

import { AssetSummary } from './components/AssetSummary'

export const Home = () => {
  return (
    <Box paddingX="4" paddingBottom="5" gap="4" flexDirection="column">
      <AssetSummary />
    </Box>
  )
}
