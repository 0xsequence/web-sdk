import React from 'react'
import { Box, Text, vars } from '@0xsequence/design-system'

import { SelectButton } from '../../shared/SelectButton'
import { SCROLLBAR_WIDTH, supportedFiatCurrencies } from '../../constants'
import { useSettings } from '../../hooks'

export const SettingsCurrency = () => {
  const { fiatCurrency, setFiatCurrency } = useSettings()
  return (
    <Box
      paddingBottom="5"
      paddingLeft="5"
      paddingTop="3"
      style={{
        paddingRight: `calc(${vars.space[5]} - ${SCROLLBAR_WIDTH})`
      }}
    >
      <Box flexDirection="column" gap="2">
        {supportedFiatCurrencies.map(currency => {
          return (
            <SelectButton
              key={currency.symbol}
              value={currency.symbol}
              selected={currency.symbol === fiatCurrency.symbol}
              onClick={() => setFiatCurrency && setFiatCurrency(currency)}
            >
              <Box gap="2" justifyContent="flex-start" alignItems="center">
                <Text color="text100" fontWeight="bold">
                  {currency.symbol}
                </Text>
                <Text color="text50">{currency.name.message}</Text>
              </Box>
            </SelectButton>
          )
        })}
      </Box>
    </Box>
  )
}
