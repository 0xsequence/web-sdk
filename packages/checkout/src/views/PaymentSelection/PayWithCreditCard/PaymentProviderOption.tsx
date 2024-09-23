import { useEffect } from 'react'

import { Box, Card, Image, Text } from '@0xsequence/design-system'

interface PaymentProviderOptionProps {
  name: string
  iconUrl?: string
  onClick: () => void
  isSelected: boolean
  isRecommended: boolean
}

export const PaymentProviderOption = ({
  iconUrl,
  name,
  onClick,
  isSelected,
  isRecommended,
}: PaymentProviderOptionProps) => {

  return (
    <Card
      borderColor={isSelected ? 'text50' : 'transparent' }
      borderWidth="thin"
      justifyContent="space-between"
      padding="4"
      onClick={onClick}
      opacity={{
        hover: '80',
        base: '100'
      }}
      cursor="pointer"
    >
      <Box flexDirection="row" gap="3">
        <Box flexDirection="column" justifyContent="space-between">
          <Text
            variant="normal"
            fontWeight="bold"
            >
              {name}
            </Text>
            <Image src={iconUrl} />
        </Box>
      </Box>
      <Box flexDirection="row" justifyContent="center" alignItems="center" gap="3">
        {isRecommended && (
          <Text color="text50">hello</Text>
        )}
      </Box>
    </Card>
  )
}