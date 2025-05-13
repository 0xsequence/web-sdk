import { useWallets } from '@0xsequence/connect'
import { CurrencyIcon, NetworkIcon, Text, WalletIcon } from '@0xsequence/design-system'

import { StackedIconTag } from '../../components/IconWrappers/StackedIconTag.js'
import { ListCardNav } from '../../components/ListCard/ListCardNav.js'
import { HEADER_HEIGHT } from '../../constants/index.js'
import { useNavigation, useSettings } from '../../hooks/index.js'

export const SettingsMenu = () => {
  const { wallets } = useWallets()
  const { selectedNetworks, fiatCurrency } = useSettings()
  // const activeWallet = wallets.find(wallet => wallet.isActive)
  // const isEmbedded = activeWallet?.id.includes('waas')

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

  // const onClickProfiles = () => {
  //   setNavigation({
  //     location: 'settings-profiles'
  //   })
  // }

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

  const walletsPreview = (
    <StackedIconTag
      label={<Text color="primary">{wallets.length}</Text>}
      iconList={wallets.map(wallet => wallet.address)}
      shape="rounded"
      isAccount
    />
  )

  const networksPreview = (
    <StackedIconTag
      label={<Text color="primary">{selectedNetworks.length}</Text>}
      iconList={selectedNetworks.map(network => {
        return `https://assets.sequence.info/images/networks/medium/${network}.webp`
      })}
    />
  )

  const currencyPreview = (
    <Text nowrap color="primary">
      {fiatCurrency.symbol} {fiatCurrency.sign}
    </Text>
  )

  return (
    <div className="px-4 pb-4" style={{ paddingTop: HEADER_HEIGHT }}>
      <div className="flex flex-col gap-2">
        <ListCardNav rightChildren={walletsPreview} onClick={onClickWallets} style={{ height: '64px' }}>
          <WalletIcon className="text-primary w-6 h-6" />
          <Text color="primary" fontWeight="medium" variant="normal">
            Manage Wallets
          </Text>
        </ListCardNav>
        <ListCardNav rightChildren={networksPreview} onClick={onClickNetworks} style={{ height: '64px' }}>
          <NetworkIcon className="text-primary w-6 h-6" />
          <Text color="primary" fontWeight="medium" variant="normal">
            Manage Networks
          </Text>
        </ListCardNav>
        <ListCardNav rightChildren={currencyPreview} onClick={onClickCurrency} style={{ height: '64px' }}>
          <CurrencyIcon className="text-primary w-6 h-6" />
          <Text color="primary" fontWeight="medium" variant="normal">
            Manage Currency
          </Text>
        </ListCardNav>
        {/* {isEmbedded && (
          <ListCardNav onClick={onClickProfiles} style={{ height: '64px' }}>
            <Text color="primary" fontWeight="medium" variant="normal">
              Manage Profiles
            </Text>
          </ListCardNav>
        )} */}
        <ListCardNav onClick={onClickPreferences} style={{ height: '64px' }}>
          <Text color="primary" fontWeight="medium" variant="normal">
            Preferences
          </Text>
        </ListCardNav>
      </div>
    </div>
  )
}
