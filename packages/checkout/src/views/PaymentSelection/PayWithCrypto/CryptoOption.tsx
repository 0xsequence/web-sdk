import { Box, Card, Text, TokenImage } from '@0xsequence/design-system'

import { SelectedIndicator } from './SelectedIndicator'

interface CryptoOptionProps {
  currencyName: string
  chainId: number
  iconUrl?: string
  symbol: string
  price: string
  onClick: () => void
  isSelected: boolean
  disabled: boolean
  isInsufficientFunds?: boolean
}

export const CryptoOption = ({
  currencyName,
  chainId,
  iconUrl,
  symbol,
  price,
  onClick,
  isSelected,
  isInsufficientFunds = false,
  disabled
}: CryptoOptionProps) => {
  const onClickCard = () => {
    if (!isInsufficientFunds && !disabled) {
      onClick()
    }
  }

  return (
    <Card
      width="full"
      justifyContent="space-between"
      padding="4"
      onClick={onClickCard}
      opacity={{
        hover: disabled || isInsufficientFunds ? '50' : '80',
        base: disabled || isInsufficientFunds ? '50' : '100'
      }}
      cursor="pointer"
    >
      <Box flexDirection="row" gap="3">
        <Box width="fit">
          <TokenImage src={iconUrl} size="lg" symbol={symbol} withNetwork={chainId} disableAnimation />
        </Box>
        <Box flexDirection="column" justifyContent="space-between">
          <Text
            variant="normal"
            fontWeight="bold"
            color="text100"
            whiteSpace="nowrap"
            ellipsis
            style={{
              overflow: 'hidden',
              width: '150px'
            }}
          >
            {currencyName}
          </Text>
          <Text
            variant="normal"
            color="text50"
            whiteSpace="nowrap"
            ellipsis
            style={{
              overflow: 'hidden',
              width: '150px'
            }}
          >
            {`${price} ${symbol}`}
          </Text>
        </Box>
      </Box>
      <Box flexDirection="row" justifyContent="center" alignItems="center" gap="3">
        <Box flexDirection="column" justifyContent="space-between" alignItems="flex-end">
          {isInsufficientFunds ? (
            <Text variant="normal" color="negative">
              Insufficient funds
            </Text>
          ) : null}
        </Box>
        <SelectedIndicator selected={isSelected} />
      </Box>
    </Card>
  )
}
