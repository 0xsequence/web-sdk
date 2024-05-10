import { Box, Button, SettingsIcon, ChevronRightIcon, CurrencyIcon, NetworkIcon, vars } from '@0xsequence/design-system'
import React from 'react'

import { HEADER_HEIGHT } from '../../constants'
import { useNavigation } from '../../hooks'

export const SettingsMenu = () => {
  const { setNavigation } = useNavigation()

  const onClickGeneral = () => {
    setNavigation({
      location: 'settings-general'
    })
  }

  const onClickCurrency = () => {
    setNavigation({
      location: 'settings-currency'
    })
  }

  const onClickNetworks = () => {
    setNavigation({
      location: 'settings-networks'
    })
  }

  return (
    <Box style={{ paddingTop: HEADER_HEIGHT }}>
      <Box padding="5" paddingTop="3">
        <Box flexDirection="column" gap="2">
          <Button
            onClick={onClickGeneral}
            leftIcon={SettingsIcon}
            rightIcon={ChevronRightIcon}
            width="full"
            label="General"
            style={{
              height: '52px',
              borderRadius: vars.radii.md
            }}
          />
          <Button
            onClick={onClickCurrency}
            leftIcon={CurrencyIcon}
            rightIcon={ChevronRightIcon}
            width="full"
            label="Currency"
            style={{
              height: '52px',
              borderRadius: vars.radii.md
            }}
          />
          <Button
            onClick={onClickNetworks}
            leftIcon={NetworkIcon}
            rightIcon={ChevronRightIcon}
            width="full"
            label="Networks"
            style={{
              height: '52px',
              borderRadius: vars.radii.md
            }}
          />
        </Box>
      </Box>
    </Box>
  )
}
