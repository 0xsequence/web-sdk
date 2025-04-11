import { Button, NumericInput, Text } from '@0xsequence/design-system'
import { ChangeEvent, useEffect, useState } from 'react'
import { formatUnits } from 'viem'

import { useSettings } from '../../hooks'
import { useSwap } from '../../hooks/useSwap'
import { formatFiatBalance, decimalsToWei } from '../../utils/formatBalance'

export const CoinInput = ({ type, disabled }: { type: 'from' | 'to'; disabled?: boolean }) => {
  const { toCoin, fromCoin, amount, nonRecentAmount, recentInput, setAmount } = useSwap()
  const coin = type === 'from' ? fromCoin : toCoin

  const { fiatCurrency } = useSettings()

  const [inputValue, setInputValue] = useState<string>('')

  const fiatBalance = formatFiatBalance(
    type === recentInput ? amount : nonRecentAmount,
    coin?.price.value || 0,
    coin?.contractInfo?.decimals || 18,
    fiatCurrency.sign
  )

  useEffect(() => {
    if (type === recentInput) {
      if (amount > 0) {
        setInputValue(formatUnits(BigInt(amount), coin?.contractInfo?.decimals || 18))
      } else if (Number(inputValue)) {
        setInputValue('')
      }
    } else if (type !== recentInput) {
      if (nonRecentAmount > 0) {
        setInputValue(formatUnits(BigInt(nonRecentAmount), coin?.contractInfo?.decimals || 18))
      } else if (Number(inputValue)) {
        setInputValue('')
      }
    }
  }, [recentInput, amount, nonRecentAmount])

  const handleChange = (ev: ChangeEvent<HTMLInputElement>) => {
    const { value } = ev.target
    const changedValue = Number(value)
    setInputValue(value)
    setAmount(decimalsToWei(changedValue, coin?.contractInfo?.decimals || 18), type)
  }

  const handleMax = () => {
    setAmount(Number(formatUnits(BigInt(coin?.balance || 0), coin?.contractInfo?.decimals || 18)), type)
  }

  return (
    <div className="w-full mt-4">
      <NumericInput
        name="amount"
        value={inputValue}
        onChange={handleChange}
        disabled={disabled}
        controls={
          <>
            {fiatBalance && (
              <Text className="whitespace-nowrap" variant="small" color="muted">
                ~{fiatBalance}
              </Text>
            )}
            {type === 'from' && (
              <Button
                disabled
                className="shrink-0"
                size="xs"
                shape="square"
                label={`Max`}
                onClick={handleMax}
                data-id="maxCoin"
              />
            )}
          </>
        }
      />
    </div>
  )
}
