import { useNavigation } from '../../hooks'

import { SettingsItem } from './SettingsItem'

export const SettingsMenu = () => {
  const { setNavigation } = useNavigation()

  const onClickWallets = () => {
    setNavigation({
      location: 'settings-wallets'
    })
  }

  const onClickNetworks = () => {
    setNavigation({
      location: 'settings-networks'
    })
  }

  const onClickProfiles = () => {
    setNavigation({
      location: 'settings-profiles'
    })
  }

  // const onClickApps = () => {
  //   setNavigation({
  //     location: 'settings-apps'
  //   })
  // }

  const onClickCurrency = () => {
    setNavigation({
      location: 'settings-currency'
    })
  }

  return (
    <div className="p-4 pt-2">
      <div className="flex flex-col gap-2">
        <SettingsItem label="Manage Wallets" onClick={onClickWallets} />
        <SettingsItem label="Manage Networks" onClick={onClickNetworks} />
        <SettingsItem label="Manage Currency" onClick={onClickCurrency} />
        <SettingsItem label="Manage Profiles" onClick={onClickProfiles} />
        {/* <SettingsItem label="Manage Apps" onClick={onClickApps} /> */}
      </div>
    </div>
  )
}
