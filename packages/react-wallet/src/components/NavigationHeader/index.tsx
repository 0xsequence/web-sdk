import { IconButton, ChevronLeftIcon, Text, ModalPrimitive } from '@0xsequence/design-system'

import { HEADER_HEIGHT } from '../../constants'
import { useNavigationContext } from '../../contexts/Navigation'
import { useNavigation } from '../../hooks/useNavigation'

interface NavigationHeaderProps {
  primaryText?: string
  secondaryText?: string
}

export const NavigationHeader = ({ secondaryText, primaryText }: NavigationHeaderProps) => {
  const { goBack, history } = useNavigation()
  const { isBackButtonEnabled } = useNavigationContext()

  const onClickBack = () => {
    if (!isBackButtonEnabled) {
      return
    }
    goBack()
  }

  return (
    <div
      className="flex bg-background-primary z-20 fixed w-full flex-row items-center justify-between px-4"
      style={{
        height: HEADER_HEIGHT,
        paddingTop: '6px'
      }}
    >
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
      <div>
        <Text fontWeight="medium" variant="small" color="muted">
          {secondaryText}
        </Text>
        <ModalPrimitive.Title asChild>
          <Text fontWeight="medium" variant="small" color="primary">
            {primaryText}
          </Text>
        </ModalPrimitive.Title>
      </div>
      <div
        style={{
          width: '44px'
        }}
      />
    </div>
  )
}
