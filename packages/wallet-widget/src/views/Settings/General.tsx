import { Card, Switch, Text } from '@0xsequence/design-system'
// import { useTheme } from '@0xsequence/connect'
import React from 'react'

import { HEADER_HEIGHT } from '../../constants'
import { useSettings } from '../../hooks'

export const SettingsGeneral = () => {
  // const { theme, setTheme } = useTheme()
  const { hideUnlistedTokens, setHideUnlistedTokens, hideCollectibles, setHideCollectibles } = useSettings()

  // const onChangeTheme = () => {
  //   setTheme && setTheme(theme === 'light' ? 'dark' : 'light')
  // }

  const onChangeHideUnlistedTokens = () => {
    setHideUnlistedTokens(!hideUnlistedTokens)
  }

  const onChangeHideCollectibles = () => {
    setHideCollectibles(!hideCollectibles)
  }

  return (
    <div style={{ paddingTop: HEADER_HEIGHT }}>
      <div className="flex gap-2 p-5 pt-3 flex-col">
        {/* <Card
          flexDirection="row"
          justifyContent="space-between"
          alignItems="center"
        >
          <Text color="primary" fontWeight="bold">
            Dark mode
          </Text>
          <Switch
            checked={theme === 'dark'}
            onCheckedChange={onChangeTheme}
          />
        </Card> */}
        <Card className="flex flex-row justify-between items-center">
          <Text color="primary" fontWeight="bold">
            Hide unlisted tokens
          </Text>
          <Switch checked={hideUnlistedTokens} onCheckedChange={onChangeHideUnlistedTokens} />
        </Card>
        <Card className="flex flex-row justify-between items-center">
          <Text color="primary" fontWeight="bold">
            Hide collectibles
          </Text>
          <Switch checked={hideCollectibles} onCheckedChange={onChangeHideCollectibles} />
        </Card>
      </div>
    </div>
  )
}
