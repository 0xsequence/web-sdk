import React from 'react'
import { Box, vars } from '@0xsequence/design-system'

import { AssetSummary } from './components/AssetSummary'
import { useScrollbarWidth } from '../../hooks/useScrollbarWidth'

export const Home = () => {
  const scrollbarWidth = useScrollbarWidth()

  return (
    <Box
      paddingLeft="5"
      paddingBottom="5"
      gap="4"
      flexDirection="column"
      style={{ paddingRight: `calc(${vars.space[5]} - ${scrollbarWidth})` }}
    >
      <AssetSummary />
    </Box>
  )
}
