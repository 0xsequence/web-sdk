import { Card, Text, TokenImage } from '@0xsequence/design-system'

import { SelectedIndicator } from './SelectedIndicator.js'

interface CryptoOptionProps {
  currencyName: string
  chainId: number
  iconUrl?: string
  symbol: string
  price: string
  onClick: () => void
  isSelected: boolean
  disabled: boolean
  showInsufficientFundsWarning?: boolean | undefined
}

export const CryptoOption = ({
  currencyName,
  chainId,
  iconUrl,
  symbol,
  price,
  onClick,
  isSelected,
  showInsufficientFundsWarning = undefined,
  disabled
}: CryptoOptionProps) => {
  const onClickCard = () => {
    if (!showInsufficientFundsWarning && !disabled) {
      onClick()
    }
  }

  return (
    <Card className="flex w-full justify-between p-4 cursor-pointer" onClick={onClickCard}>
      <div className="flex flex-row gap-3">
        <div className="w-fit">
          <TokenImage src={iconUrl} size="lg" symbol={symbol} withNetwork={chainId} disableAnimation />
        </div>
        <div className="flex flex-col justify-center">
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
          {price && (
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
          )}
        </div>
      </div>
      <div className="flex flex-row justify-center items-center gap-3">
        {showInsufficientFundsWarning ? (
          <div className="flex flex-col text-center justify-between items-end">
            <Text variant="small" color="negative">
              Insufficient funds
            </Text>
          </div>
        ) : (
          <SelectedIndicator selected={isSelected} />
        )}
      </div>
    </Card>
  )
}
