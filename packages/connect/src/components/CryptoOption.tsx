import { Card, Text, TokenImage } from '@0xsequence/design-system'

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
    <Card className="flex w-full justify-between p-4 cursor-pointer" onClick={onClickCard}>
      <div className="flex flex-row gap-3">
        <div className="w-fit">
          <TokenImage src={iconUrl} size="lg" symbol={symbol} withNetwork={chainId} disableAnimation />
        </div>
        <div className="flex flex-col justify-between">
          <Text
            className="whitespace-nowrap"
            variant="normal"
            fontWeight="bold"
            color="primary"
            ellipsis
            style={{
              overflow: 'hidden',
              maxWidth: '215px'
            }}
          >
            {currencyName}
          </Text>
          <Text
            className="whitespace-nowrap"
            variant="normal"
            color="muted"
            ellipsis
            style={{
              overflow: 'hidden',
              width: '215px'
            }}
          >
            {`${price} ${symbol}`}
          </Text>
        </div>
      </div>
      <div className="flex flex-row justify-center items-center gap-3">
        <div className="flex flex-col text-center justify-between items-end">
          {isInsufficientFunds ? (
            <Text variant="small" color="negative">
              Insufficient funds
            </Text>
          ) : null}
        </div>
        <SelectedIndicator selected={isSelected} />
      </div>
    </Card>
  )
}
