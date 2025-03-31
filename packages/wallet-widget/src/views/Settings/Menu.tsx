import { useWallets } from '@0xsequence/connect'
import { Text } from '@0xsequence/design-system'

import { ListCardNav } from '../../components/ListCard/ListCardNav'
import { useNavigation } from '../../hooks'

export const SettingsMenu = () => {
  const { wallets } = useWallets()
  const activeWallet = wallets.find(wallet => wallet.isActive)
  const isEmbedded = activeWallet?.id.includes('waas')

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

  const onClickPreferences = () => {
    setNavigation({
      location: 'settings-preferences'
    })
  }

  return (
    <div className="p-4">
      <div className="flex flex-col gap-2">
        <ListCardNav onClick={onClickWallets} style={{ height: '64px' }}>
          <Text color="primary" fontWeight="medium" variant="normal">
            Manage Wallets
          </Text>
        </ListCardNav>
        <ListCardNav onClick={onClickNetworks} style={{ height: '64px' }}>
          <Text color="primary" fontWeight="medium" variant="normal">
            Manage Networks
          </Text>
        </ListCardNav>
        <ListCardNav onClick={onClickCurrency} style={{ height: '64px' }}>
          <Text color="primary" fontWeight="medium" variant="normal">
            Manage Currency
          </Text>
        </ListCardNav>
        {isEmbedded && (
          <ListCardNav onClick={onClickProfiles} style={{ height: '64px' }}>
            <Text color="primary" fontWeight="medium" variant="normal">
              Manage Profiles
            </Text>
          </ListCardNav>
        )}
        <ListCardNav onClick={onClickPreferences} style={{ height: '64px' }}>
          <Text color="primary" fontWeight="medium" variant="normal">
            Preferences
          </Text>
        </ListCardNav>
      </div>
    </div>
  )
}
