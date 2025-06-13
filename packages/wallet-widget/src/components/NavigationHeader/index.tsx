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
  info?: TokenInfo
  label?: string
}

export interface TokenInfo {
  chainId: number
  contractAddress: string
  tokenId?: string
  accountAddress?: string
}

const getHeaderContent = (type: NavigationHeaderProps['type'], info?: TokenInfo, label?: string) => {
  switch (type) {
    case 'home':
      return <HomeHeader />
    case 'search':
      return <SearchHeader />
    case 'settings':
      return <SettingsHeader />
    case 'token':
      return <TokenHeader {...info!} /> // TODO: add imgSrc and imgLabel?
    case 'collectible':
      return <CollectibleHeader {...info!} />
    case 'collection':
      return <CollectionHeader {...info!} />
    case 'default':
      return (
        <Text variant="medium" color="primary">
          {label}
        </Text>
      )
  }
}

export const NavigationHeader = ({ type = 'default', info, label }: NavigationHeaderProps) => {
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
          className="bg-background-secondary"
          onClick={onClickBack}
          icon={ChevronLeftIcon}
          size="sm"
          disabled={!isBackButtonEnabled}
          style={{ opacity: isBackButtonEnabled ? 1 : 0.5, marginLeft: '16px' }}
        />
      ) : (
        <div />
      )}

      {getHeaderContent(type, info, label)}

      {type !== 'search' && history.length > 0 ? <div style={{ width: '52px' }} /> : <div />}
    </div>
  )
}
