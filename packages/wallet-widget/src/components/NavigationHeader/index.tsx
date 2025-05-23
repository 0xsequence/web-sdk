import { ChevronLeftIcon, IconButton } from '@0xsequence/design-system'

import { HEADER_HEIGHT } from '../../constants/index.js'
import { useNavigationContext } from '../../contexts/Navigation.js'
import { useNavigation } from '../../hooks/index.js'

import { Collectible } from './content/Collectible.js'
import { Collection } from './content/Collection.js'
import { Home } from './content/Home.js'
import { Search } from './content/Search.js'
import { Settings } from './content/Settings.js'
import { Token } from './content/Token.js'

interface NavigationHeaderProps {
  type: 'home' | 'search' | 'settings' | 'token' | 'collectible' | 'collection'
  imgSrc?: string
  imgLabel?: string
}

const getHeaderContent = (type: NavigationHeaderProps['type'], imgSrc?: string, imgLabel?: string) => {
  switch (type) {
    case 'home':
      return <Home />
    case 'search':
      return <Search />
    case 'settings':
      return <Settings />
    case 'token':
      return <Token /> // TODO: add imgSrc and imgLabel?
    case 'collectible':
      return <Collectible imgSrc={imgSrc} imgLabel={imgLabel} />
    case 'collection':
      return <Collection imgSrc={imgSrc} imgLabel={imgLabel} />
  }
}

export const NavigationHeader = ({ type, imgSrc, imgLabel }: NavigationHeaderProps) => {
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

      {getHeaderContent(type, imgSrc, imgLabel)}

      {type !== 'search' && history.length > 0 ? <div style={{ width: '52px' }} /> : <div />}
    </div>
  )
}
