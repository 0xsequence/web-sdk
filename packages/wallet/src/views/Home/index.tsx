import { Box } from '@0xsequence/design-system'
import React from 'react'

import { AssetSummary } from './components/AssetSummary'

export const Home = () => {
  return (
    <Box paddingX="4" paddingBottom="5" gap="4" flexDirection="column">
      <AssetSummary />
    </Box>
  )
}
