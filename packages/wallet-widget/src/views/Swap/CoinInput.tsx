import { Button, NumericInput, Text } from '@0xsequence/design-system'
import { ChangeEvent } from 'react'
import { formatUnits } from 'viem'

import { useSettings } from '../../hooks'
import { TokenBalanceWithPrice } from '../../utils'
import { formatFiatBalance, decimalsToWei } from '../../utils/formatBalance'

export const CoinInput = ({
  coin,
  type,
  value,
  setValue,
  disabled
}: {
  coin: TokenBalanceWithPrice
  type: 'from' | 'to'
  value: string
  setValue: (value: string, type: 'from' | 'to') => void
  disabled?: boolean
}) => {
  const { fiatCurrency } = useSettings()

  const fiatBalance = formatFiatBalance(
    decimalsToWei(value, coin.contractInfo?.decimals || 18),
    coin.price.value,
    coin.contractInfo?.decimals || 18,
    fiatCurrency.sign
  )

  const handleChange = (ev: ChangeEvent<HTMLInputElement>) => {
    const { value } = ev.target
    setValue(value, type)
  }

  const handleMax = () => {
    setValue(formatUnits(BigInt(coin.balance), coin.contractInfo?.decimals || 18), type)
  }

  return (
    <div className="w-full mt-4">
      <NumericInput
        name="amount"
        value={value}
        onChange={handleChange}
        disabled={disabled}
        controls={
          <>
            {value && Number(value) > 0 && fiatBalance !== '' && (
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
