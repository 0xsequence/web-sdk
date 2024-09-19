import { Box, Card, Text, TokenImage, NetworkImage } from '@0xsequence/design-system'

interface CryptoOptionProps {
  chainId: number
  iconUrl?: string
  symbol: string
  balance: string
  price: string
  onClick: () => void
  isSelected: boolean
  isInsufficientFunds: boolean
}

export const CryptoOption = ({
  chainId,
  iconUrl,
  symbol,
  balance,
  price,
  onClick,
  isSelected,
  isInsufficientFunds
}: CryptoOptionProps) => {
  return (
    <Card justifyContent="space-between" padding="4">
      <Box>
         <TokenImage size="lg" src={iconUrl} />
      </Box>
      <Box>
         <Text color="text100">priceing</Text>
      </Box>
    </Card>
  )
}