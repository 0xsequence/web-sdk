import { Text } from '@0xsequence/design-system'
import { useObservable } from 'micro-observables'

import { ListCard } from '../../components/ListCard/ListCard.js'
import { supportedFiatCurrencies } from '../../constants/index.js'
import { useSettings } from '../../hooks/index.js'

export const SettingsCurrency = () => {
  const { fiatCurrencyObservable, setFiatCurrency } = useSettings()
  const fiatCurrency = useObservable(fiatCurrencyObservable)

  return (
    <div className="px-4 pb-4">
      <div className="flex flex-col gap-2">
        {supportedFiatCurrencies.map((currency, index) => {
          return (
            <ListCard
              type="radio"
              key={index}
              isSelected={currency.symbol === fiatCurrency.symbol}
              onClick={() => setFiatCurrency && setFiatCurrency(currency)}
            >
              <Text color="primary" fontWeight="bold">
                {currency.symbol}
              </Text>
              <Text color="muted">{currency.name.message}</Text>
            </ListCard>
          )
        })}
      </div>
    </div>
  )
}
