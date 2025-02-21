import { Text } from '@0xsequence/design-system';
import React from 'react'

import { supportedFiatCurrencies } from '../../constants'
import { useSettings } from '../../hooks'
import { SelectButton } from '../../shared/SelectButton'

export const SettingsCurrency = () => {
  const { fiatCurrency, setFiatCurrency } = useSettings()

  return (
    (<div className="pb-5 px-4 pt-3">
      <div className="flex flex-col gap-2">
        {supportedFiatCurrencies.map(currency => {
          return (
            (<SelectButton
              key={currency.symbol}
              value={currency.symbol}
              selected={currency.symbol === fiatCurrency.symbol}
              onClick={() => setFiatCurrency && setFiatCurrency(currency)}
            >
              <div className="flex gap-2 justify-start items-center">
                <Text color="text100" fontWeight="bold">
                  {currency.symbol}
                </Text>
                <Text color="text50">{currency.name.message}</Text>
              </div>
            </SelectButton>)
          );
        })}
      </div>
    </div>)
  );
}
