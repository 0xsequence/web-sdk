import { Box, IconButton, ChevronLeftIcon, Text, ModalPrimitive } from '@0xsequence/design-system'

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
    if (!isBackButtonEnabled) return
    goBack()
  }

  return (
    <Box
      background="backgroundPrimary"
      zIndex="20"
      position="fixed"
      width="full"
      flexDirection="row"
      alignItems="center"
      justifyContent="space-between"
      paddingX="4"
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
        <Box />
      )}
      <Box>
        <Text fontWeight="medium" variant="small" color="text50">
          {secondaryText}
        </Text>
        <ModalPrimitive.Title asChild>
          <Text fontWeight="medium" variant="small" color="text100">
            {primaryText}
          </Text>
        </ModalPrimitive.Title>
      </Box>
      <Box
        style={{
          width: '44px'
        }}
      />
    </Box>
  )
}
