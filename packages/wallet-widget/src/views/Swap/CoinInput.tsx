import { Button, NumericInput, Text } from '@0xsequence/design-system'
import { ChangeEvent, useEffect, useMemo, useState } from 'react'
import { formatUnits } from 'viem'
import { useChains } from 'wagmi'

import { useSettings } from '../../hooks'
import { TokenBalanceWithPrice } from '../../utils'
import { formatFiatBalance, decimalsToWei } from '../../utils/formatBalance'

export const CoinInput = ({
  coin,
  type,
  setAmount
}: {
  coin: TokenBalanceWithPrice
  type: 'from' | 'to'
  setAmount: (amount: string) => void
}) => {
  const { fiatCurrency } = useSettings()
  const [value, setValue] = useState<string>('')

  const fiatBalance = formatFiatBalance(
    decimalsToWei(value, coin.contractInfo?.decimals || 18),
    coin.price.value,
    coin.contractInfo?.decimals || 18,
    fiatCurrency.sign
  )

  const hasSufficientFunds = useMemo(() => {
    return value > coin.balance
  }, [coin.balance, value])

  useEffect(() => {
    setAmount(value)
  }, [value])

  const handleChange = (ev: ChangeEvent<HTMLInputElement>) => {
    const { value } = ev.target
    setValue(value)
  }

  const handleMax = () => {
    setValue(formatUnits(BigInt(coin.balance), coin.contractInfo?.decimals || 18))
  }

  return (
    <div className="w-full mt-4">
      <NumericInput
        name="amount"
        value={value}
        onChange={handleChange}
        controls={
          <>
            {fiatBalance !== '' && (
              <Text className="whitespace-nowrap" variant="small" color="muted">
                ~{fiatBalance}
              </Text>
            )}
            {type === 'from' && (
              <Button className="shrink-0" size="xs" shape="square" label={`Max`} onClick={handleMax} data-id="maxCoin" />
            )}
          </>
        }
      />
      {!hasSufficientFunds && (
        <Text className="mt-2" variant="normal" color="negative" asChild>
          Insufficient Funds
        </Text>
      )}
    </div>
  )
}
