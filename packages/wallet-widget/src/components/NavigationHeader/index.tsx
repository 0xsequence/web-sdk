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
      className="flex flex-row justify-between items-center fixed bg-background-primary w-full p-4 z-20"
      style={{
        height: HEADER_HEIGHT
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
          <Text fontWeight="bold" variant="medium" color="primary">
            {primaryText}
          </Text>
        </ModalPrimitive.Title>
      </div>
      <div
        style={{
          width: '28px'
        }}
      />
    </div>
  )
}
