import { Button, NumericInput, Text } from '@0xsequence/design-system'
import { ChangeEvent, useEffect, useState } from 'react'
import { formatUnits } from 'viem'

import { useSettings } from '../../hooks'
import { useSwap } from '../../hooks/useSwap'
import { formatFiatBalance, decimalsToWei } from '../../utils/formatBalance'

export const CoinInput = ({ type, disabled }: { type: 'from' | 'to'; disabled?: boolean }) => {
  const { toCoin, fromCoin, toAmount, fromAmount, setToAmount, setFromAmount, setRecentInput } = useSwap()
  const coin = type === 'from' ? fromCoin : toCoin
  const amount = type === 'from' ? fromAmount : toAmount
  const setAmount = type === 'from' ? setFromAmount : setToAmount

  const { fiatCurrency } = useSettings()

  const [inputValue, setInputValue] = useState<string>('')

  const fiatBalance = formatFiatBalance(
    amount || 0,
    coin?.price.value || 0,
    coin?.contractInfo?.decimals || 18,
    fiatCurrency.sign
  )

  useEffect(() => {
    const formattedAmount = formatUnits(BigInt(amount || 0), coin?.contractInfo?.decimals || 18)
    if (formattedAmount !== '0') {
      setInputValue(formattedAmount)
    } else if (Number(inputValue) > 0) {
      setInputValue('')
    }
  }, [amount])

  const handleChange = (ev: ChangeEvent<HTMLInputElement>) => {
    const { value } = ev.target
    const changedValue = Number(value)

    if (type === 'from') {
      setFromAmount(decimalsToWei(changedValue, coin?.contractInfo?.decimals || 18))
      setRecentInput('from')
    } else {
      setToAmount(decimalsToWei(changedValue, coin?.contractInfo?.decimals || 18))
      setRecentInput('to')
    }

    setInputValue(value)
  }

  const handleMax = () => {
    setAmount(Number(formatUnits(BigInt(coin?.balance || 0), coin?.contractInfo?.decimals || 18)))
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
            {amount && Number(amount) > 0 && fiatBalance !== '' && (
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
