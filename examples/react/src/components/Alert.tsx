import { Box, Button, Text } from '@0xsequence/design-system'
import { ComponentProps } from 'react'

export type AlertProps = {
  title: string
  description: string
  secondaryDescription?: string
  variant: 'negative' | 'warning' | 'positive'
  buttonProps?: ComponentProps<typeof Button>
  children?: React.ReactNode
}

export const Alert = ({ title, description, secondaryDescription, variant, buttonProps, children }: AlertProps) => {
  return (
    <Box borderRadius="md" background={variant}>
      <Box
        background="backgroundOverlay"
        borderRadius="md"
        paddingX={{ sm: '4', md: '5' }}
        paddingY="4"
        width="full"
        flexDirection="column"
        gap="3"
      >
        <Box width="full" flexDirection={{ sm: 'column', md: 'row' }} gap="2" justifyContent="space-between">
          <Box flexDirection="column" gap="1">
            <Text variant="normal" color="text100" fontWeight="medium">
              {title}
            </Text>

            <Text variant="normal" color="text50" fontWeight="medium">
              {description}
            </Text>

            {secondaryDescription && (
              <Text variant="normal" color="text80" fontWeight="medium">
                {secondaryDescription}
              </Text>
            )}
          </Box>

          {buttonProps ? (
            <Box background={variant} borderRadius="sm" width={'min'} height={'min'}>
              <Button variant="emphasis" shape="square" flexShrink="0" {...buttonProps} />
            </Box>
          ) : null}
        </Box>

        {children}
      </Box>
    </Box>
  )
}
