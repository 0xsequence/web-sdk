import React from 'react'
import { Box, Card, Switch, Text } from '@0xsequence/design-system'
import { useTheme } from '@0xsequence/kit'

import { HEADER_HEIGHT } from '../../constants'
import { useSettings } from '../../hooks'

export const SettingsGeneral = () => {
  const { theme, setTheme } = useTheme()
  const { hideUnlistedTokens, setHideUnlistedTokens, hideCollectibles, setHideCollectibles } = useSettings()

  const onChangeTheme = () => {
    setTheme && setTheme(theme === 'light' ? 'dark' : 'light')
  }

  const onChangeHideUnlistedTokens = () => {
    setHideUnlistedTokens(!hideUnlistedTokens)
  }

  const onChangeHideCollectibles = () => {
    setHideCollectibles(!hideCollectibles)
  }

  return (
    <Box style={{ paddingTop: HEADER_HEIGHT }}>
      <Box gap="2" padding="5" paddingTop="3" flexDirection="column">
        {/* <Card
          flexDirection="row"
          justifyContent="space-between"
          alignItems="center"
        >
          <Text color="text100" fontWeight="bold">
            Dark mode
          </Text>
          <Switch
            checked={theme === 'dark'}
            onCheckedChange={onChangeTheme}
          />
        </Card> */}
        <Card flexDirection="row" justifyContent="space-between" alignItems="center">
          <Text color="text100" fontWeight="bold">
            Hide unlisted tokens
          </Text>
          <Switch checked={hideUnlistedTokens} onCheckedChange={onChangeHideUnlistedTokens} />
        </Card>
        <Card flexDirection="row" justifyContent="space-between" alignItems="center">
          <Text color="text100" fontWeight="bold">
            Hide collectibles
          </Text>
          <Switch checked={hideCollectibles} onCheckedChange={onChangeHideCollectibles} />
        </Card>
      </Box>
    </Box>
  )
}
