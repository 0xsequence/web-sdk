import { Button, SettingsIcon, ChevronRightIcon, CurrencyIcon, NetworkIcon } from '@0xsequence/design-system'
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
    <div style={{ paddingTop: HEADER_HEIGHT }}>
      <div className="p-5 pt-3">
        <div className="flex flex-col gap-2">
          <Button
            className="w-full rounded-xl"
            size="lg"
            onClick={onClickGeneral}
            leftIcon={SettingsIcon}
            rightIcon={ChevronRightIcon}
            label="General"
          />
          <Button
            className="w-full rounded-xl"
            size="lg"
            onClick={onClickCurrency}
            leftIcon={CurrencyIcon}
            rightIcon={ChevronRightIcon}
            label="Currency"
          />
          <Button
            className="w-full rounded-xl"
            size="lg"
            onClick={onClickNetworks}
            leftIcon={NetworkIcon}
            rightIcon={ChevronRightIcon}
            label="Networks"
          />
        </div>
      </div>
    </div>
  )
}
