import { ChevronLeftIcon, IconButton } from '@0xsequence/design-system'

import { HEADER_HEIGHT } from '../../constants/index.js'
import { useNavigationContext } from '../../contexts/Navigation.js'
import { useNavigation } from '../../hooks/index.js'

import { Home } from './content/home.js'

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
      return <div />
    case 'settings':
      return <div />
    case 'token':
      return <div />
    case 'collectible':
      return <div />
    case 'collection':
      return <div />
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
          size="xs"
          disabled={!isBackButtonEnabled}
          style={{ opacity: isBackButtonEnabled ? 1 : 0.5 }}
        />
      ) : (
        <div />
      )}

      {getHeaderContent(type, imgSrc, imgLabel)}

      {/* <div style={{ width: '28px' }} /> */}
    </div>
  )
}
