import { ChevronLeftIcon, IconButton, Text } from '@0xsequence/design-system'

import { HEADER_HEIGHT } from '../../constants/index.js'
import { useNavigationContext } from '../../contexts/Navigation.js'
import { useNavigation } from '../../hooks/index.js'

import { CollectibleHeader } from './content/CollectibleHeader.js'
import { CollectionHeader } from './content/CollectionHeader.js'
import { HomeHeader } from './content/HomeHeader.js'
import { SearchHeader } from './content/SearchHeader.js'
import { SettingsHeader } from './content/SettingsHeader.js'
import { TokenHeader } from './content/TokenHeader.js'

interface NavigationHeaderProps {
  type?: 'home' | 'search' | 'settings' | 'token' | 'collectible' | 'collection' | 'default'
  imgSrc?: string
  imgLabel?: string
  label?: string
}

const getHeaderContent = (type: NavigationHeaderProps['type'], imgSrc?: string, imgLabel?: string, label?: string) => {
  switch (type) {
    case 'home':
      return <HomeHeader />
    case 'search':
      return <SearchHeader />
    case 'settings':
      return <SettingsHeader />
    case 'token':
      return <TokenHeader /> // TODO: add imgSrc and imgLabel?
    case 'collectible':
      return <CollectibleHeader imgSrc={imgSrc} imgLabel={imgLabel} />
    case 'collection':
      return <CollectionHeader imgSrc={imgSrc} imgLabel={imgLabel} />
    case 'default':
      return (
        <Text variant="medium" color="primary">
          {label}
        </Text>
      )
  }
}

export const NavigationHeader = ({ type = 'default', imgSrc, imgLabel, label }: NavigationHeaderProps) => {
  const { goBack, history } = useNavigation()
  const { isBackButtonEnabled } = useNavigationContext()

  const onClickBack = () => {
    if (!isBackButtonEnabled) {
      return
    }
    goBack()
  }

  return (
    <div className="flex flex-row justify-between items-center w-full" style={{ minHeight: HEADER_HEIGHT }}>
      {history.length > 0 ? (
        <IconButton
          onClick={onClickBack}
          icon={ChevronLeftIcon}
          size="sm"
          disabled={!isBackButtonEnabled}
          style={{ opacity: isBackButtonEnabled ? 1 : 0.5, marginLeft: '16px' }}
        />
      ) : (
        <div />
      )}

      {getHeaderContent(type, imgSrc, imgLabel, label)}

      {type !== 'search' && history.length > 0 ? <div style={{ width: '52px' }} /> : <div />}
    </div>
  )
}
