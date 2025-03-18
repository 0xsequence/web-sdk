import { Text } from '@0xsequence/design-system'

import { SelectButton } from '../../components/SelectButton'
import { supportedFiatCurrencies } from '../../constants'
import { useSettings } from '../../hooks'

export const SettingsProfiles = () => {
  const { fiatCurrency, setFiatCurrency } = useSettings()

  return (
    <div className="flex flex-col pb-5 px-4 pt-3 gap-2">
      {supportedFiatCurrencies.map(currency => {
        return (
          <SelectButton
            key={currency.symbol}
            value={currency.symbol}
            selected={currency.symbol === fiatCurrency.symbol}
            onClick={() => setFiatCurrency && setFiatCurrency(currency)}
          >
            <div className="flex gap-2 justify-start items-center">
              <Text color="primary" fontWeight="bold">
                {currency.symbol}
              </Text>
              <Text color="muted">{currency.name.message}</Text>
            </div>
          </SelectButton>
        )
      })}
    </div>
  )
}
