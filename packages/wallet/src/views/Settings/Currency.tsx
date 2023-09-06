import React from 'react'
import { Box, Text } from '@0xsequence/design-system'

import { SelectButton } from '../../shared/SelectButton'
import { HEADER_HEIGHT, supportedFiatCurrencies } from '../../constants'
import { useSettings } from '../../hooks'

export const SettingsCurrency = () => {
  const { fiatCurrency, setFiatCurrency } = useSettings()
  return (
    <Box>
      <Box padding="5" paddingTop="3">
        <Box
          flexDirection="column"
          gap="2"
        >
          {supportedFiatCurrencies.map((currency) => {
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
                  <Text color="text50">
                    {currency.name.message}
                  </Text>
                </Box>
              </SelectButton>
            )
          })}
        </Box>
      </Box>
    </Box>
  )
}