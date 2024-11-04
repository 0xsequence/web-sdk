import { Box, Card, Text, TokenImage } from '@0xsequence/design-system'
import { SelectedIndicator } from '../PaymentSelection/PayWithCrypto/SelectedIndicator'

interface ClickableOptionProps {
  onClick: () => void
  symbol: string
  price: string
  isSelected: boolean
  isDisabled: boolean
  logoURI?: string
}

export const ClickableOption = ({ onClick, symbol, price, logoURI, isSelected, isDisabled }: ClickableOptionProps) => {
  return (
    <Card
      opacity={{ hover: '80', base: isDisabled ? '80' : '100' }}
      width="full"
      flexDirection="row"
      alignItems="center"
      justifyContent="space-between"
      cursor="pointer"
      style={{
        minHeight: '50px'
      }}
      onClick={() => {
        if (!isDisabled) {
          onClick()
        }
      }}
    >
      <Box justifyContent="flex-start" gap="1">
        <Text color="text100"> {`${price} ${symbol}`}</Text>
        <TokenImage disableAnimation size="sm" src={logoURI} />
      </Box>
      <SelectedIndicator selected={isSelected} />
    </Card>
  )
}
