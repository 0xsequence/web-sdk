import { Button, SettingsIcon, ChevronRightIcon, CurrencyIcon, NetworkIcon } from '@0xsequence/design-system'

import { HEADER_HEIGHT } from '../../constants'
import { useNavigation } from '../../hooks'

export const SettingsMenu = () => {
  const { setNavigation } = useNavigation()

  const onClickWallets = () => {
    setNavigation({
      location: 'settings-wallets'
    })
  }

  const onClickProfiles = () => {
    setNavigation({
      location: 'settings-profiles'
    })
  }

  const onClickApps = () => {
    setNavigation({
      location: 'settings-apps'
    })
  }

  return (
    <div style={{ paddingTop: HEADER_HEIGHT }}>
      <div className="p-5 pt-3">
        <div className="flex flex-col gap-2">
          <Button
            className="w-full rounded-xl"
            size="lg"
            onClick={onClickWallets}
            leftIcon={SettingsIcon}
            rightIcon={ChevronRightIcon}
            label="Wallets"
          />
          <Button
            className="w-full rounded-xl"
            size="lg"
            onClick={onClickProfiles}
            leftIcon={CurrencyIcon}
            rightIcon={ChevronRightIcon}
            label="Profiles"
          />
          <Button
            className="w-full rounded-xl"
            size="lg"
            onClick={onClickApps}
            leftIcon={NetworkIcon}
            rightIcon={ChevronRightIcon}
            label="Apps"
          />
        </div>
      </div>
    </div>
  )
}
