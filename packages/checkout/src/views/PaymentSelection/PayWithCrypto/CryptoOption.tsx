import { useEffect } from 'react'

import { Box, Card, Text } from '@0xsequence/design-system'
import { TokenWithChainImage } from '@0xsequence/kit'

import { SelectedIndicator } from './SelectedIndicator'

interface CryptoOptionProps {
  currencyName: string
  chainId: number
  iconUrl?: string
  symbol: string
  balance: string
  price: string
  fiatPrice: string
  onClick: () => void
  isSelected: boolean
  disabled: boolean
  isInsufficientFunds: boolean
}

export const CryptoOption = ({
  currencyName,
  chainId,
  iconUrl,
  symbol,
  balance,
  price,
  fiatPrice,
  onClick,
  isSelected,
  isInsufficientFunds,
  disabled
}: CryptoOptionProps) => {
  const onClickCard = () => {
    if (!isInsufficientFunds && !disabled) {
     onClick()
    }
  }

  return (
    <Card
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
          <TokenWithChainImage src={iconUrl} symbol={symbol} chainId={chainId} />
        </Box>
        <Box flexDirection="column" justifyContent="space-between">
          <Text
            variant="normal"
            fontWeight="bold"
            color="text100"
            whiteSpace="nowrap"
            textOverflow="ellipsis"
            style={{
              overflow: 'hidden',
              width: '100px'
             }}
            >
              {currencyName}
            </Text>
          <Text
            variant="normal"
            color="text50"
            whiteSpace="nowrap"
            textOverflow="ellipsis"
            style={{
              overflow: 'hidden',
              width: '100px'
             }}
          >
            {`${balance} ${symbol}`}
          </Text>
        </Box>
      </Box>
      <Box flexDirection="row" justifyContent="center" alignItems="center" gap="3">
        <Box flexDirection="column" justifyContent="space-between" alignItems="flex-end">
          <Text variant="normal" color="text50">{`${price} ${symbol}`}</Text>
          {isInsufficientFunds ? (
            <Text variant="normal" color="negative">Insufficient funds</Text>
          ) : (
            <Text variant="normal" color="text50">{`$${fiatPrice}`}</Text>
          )}
        </Box>
        <SelectedIndicator selected={isSelected} />  
      </Box>
    </Card>
  )
}