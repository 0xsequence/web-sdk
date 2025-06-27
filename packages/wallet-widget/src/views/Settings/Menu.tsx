import { useSocialLink, useWallets } from '@0xsequence/connect'
import { CurrencyIcon, Text, WalletIcon } from '@0xsequence/design-system'

import { StackedIconTag } from '../../components/IconWrappers/StackedIconTag.js'
import { ListCard } from '../../components/ListCard/ListCard.js'
import { useNavigation, useSettings } from '../../hooks/index.js'
import { useShared } from '../../hooks/useShared.js'

export const SettingsMenu = () => {
  const { setIsSocialLinkOpen } = useSocialLink()
  const { wallets } = useWallets()
  const { fiatCurrency } = useSettings()
  const { isGuest } = useShared()
  // const activeWallet = wallets.find(wallet => wallet.isActive)
  // const isEmbedded = activeWallet?.id.includes('waas')

  const { setNavigation } = useNavigation()

  const onClickWallets = () => {
    setNavigation({
      location: 'settings-wallets'
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

  const onClickGuest = () => {
    setIsSocialLinkOpen(true)
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

  const currencyPreview = (
    <Text nowrap color="primary">
      {fiatCurrency.symbol} {fiatCurrency.sign}
    </Text>
  )

  return (
    <div className="px-4 pb-4">
      <div className="flex flex-col gap-2">
        <ListCard type="chevron" rightChildren={walletsPreview} onClick={onClickWallets}>
          <WalletIcon className="text-primary w-6 h-6" />
          <Text color="primary" fontWeight="medium" variant="normal">
            Manage Wallets
          </Text>
        </ListCard>
        <ListCard type="chevron" rightChildren={currencyPreview} onClick={onClickCurrency}>
          <CurrencyIcon className="text-primary w-6 h-6" />
          <Text color="primary" fontWeight="medium" variant="normal">
            Manage Currency
          </Text>
        </ListCard>
        {/* {isEmbedded && (
          <ListCard type="chevron" onClick={onClickProfiles}>
            <Text color="primary" fontWeight="medium" variant="normal">
              Manage Profiles
            </Text>
          </ListCard>
        )} */}
        <ListCard type="chevron" onClick={onClickPreferences}>
          <Text color="primary" fontWeight="medium" variant="normal">
            Preferences
          </Text>
        </ListCard>
        {isGuest && (
          <ListCard type="chevron" onClick={onClickGuest}>
            <Text color="warning" fontWeight="medium" variant="normal">
              Link Guest Account
            </Text>
          </ListCard>
        )}
      </div>
    </div>
  )
}
