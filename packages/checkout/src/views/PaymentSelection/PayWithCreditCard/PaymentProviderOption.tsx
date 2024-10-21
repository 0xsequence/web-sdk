import { Box, Card, Text } from '@0xsequence/design-system'

interface PaymentProviderOptionProps {
  name: string
  onClick: () => void
  isSelected: boolean
  isRecommended: boolean
  logo: JSX.Element
}

export const PaymentProviderOption = ({ name, onClick, isSelected, isRecommended, logo }: PaymentProviderOptionProps) => {
  return (
    <Card
      borderColor={isSelected ? 'backgroundRaised' : 'transparent'}
      borderWidth="thick"
      borderStyle="solid"
      justifyContent="space-between"
      padding="4"
      onClick={onClick}
      opacity={{
        hover: '80',
        base: '100'
      }}
      cursor="pointer"
    >
      <Box justifyContent="space-between" width="full">
        <Box justifyContent="space-between" alignItems="center" gap="3">
          <Box borderRadius="md">{logo}</Box>
          <Text variant="normal" fontWeight="bold" color="text80">
            {name}
          </Text>
        </Box>
        <Box flexDirection="row" justifyContent="center" alignItems="center" gap="3">
          {isRecommended && (
            <Text color="text50" variant="small">
              Recommended
            </Text>
          )}
        </Box>
      </Box>
    </Card>
  )
}
