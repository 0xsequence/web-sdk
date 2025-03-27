import { Text } from '@0xsequence/design-system'
// import { SelectButton } from '../../components/SelectButton'
import { useObservable } from 'micro-observables'

import { ListCardSelect } from '../../components/ListCard/ListCardSelect'
import { supportedFiatCurrencies } from '../../constants'
import { useSettings } from '../../hooks'

export const LegacySettingsCurrency = () => {
  const { fiatCurrencyObservable, setFiatCurrency } = useSettings()
  const fiatCurrency = useObservable(fiatCurrencyObservable)

  return (
    <div className="pb-5 px-4 pt-3">
      <div className="flex flex-col gap-2">
        {supportedFiatCurrencies.map(currency => {
          return (
            // <SelectButton
            //   key={currency.symbol}
            //   value={currency.symbol}
            //   selected={currency.symbol === fiatCurrency.symbol}
            //   onClick={() => setFiatCurrency && setFiatCurrency(currency)}
            // >
            //   <div className="flex gap-2 justify-start items-center">
            //     <Text color="primary" fontWeight="bold">
            //       {currency.symbol}
            //     </Text>
            //     <Text color="muted">{currency.name.message}</Text>
            //   </div>
            // </SelectButton>
            <ListCardSelect
              isSelected={currency.symbol === fiatCurrency.symbol}
              onClick={() => setFiatCurrency && setFiatCurrency(currency)}
            >
              <Text color="primary" fontWeight="bold">
                {currency.symbol}
              </Text>
              <Text color="muted">{currency.name.message}</Text>
            </ListCardSelect>
          )
        })}
      </div>
    </div>
  )
}
