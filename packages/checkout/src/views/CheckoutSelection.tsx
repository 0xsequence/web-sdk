import React from 'react'
import {
  Box,
  Button,
  ChevronRightIcon,
  Divider,
  Text,
  PaymentsIcon,
  vars
} from '@0xsequence/design-system'
import { CoinIcon } from '../shared/components/CoinIcon'
import { HEADER_HEIGHT } from '../constants'
import { useNavigation, useCheckoutModal } from '../hooks'

export const CheckoutSelection = () => {
  const { setNavigation } = useNavigation()
  const { closeCheckout, settings } = useCheckoutModal()

  const displayCryptoCheckout = !!settings?.cryptoCheckout
  const displayCreditCardCheckout = !!settings?.creditCardCheckout

  const onClickPayWithCard = () => {
    setNavigation({
      location: 'transaction-form'
    })
  }

  const onClickPayWithCrypto = () => {
    console.log('trigger transaction')
    const transaction = settings?.cryptoCheckout?.triggerTransaction
    transaction && transaction()
    closeCheckout && closeCheckout()
  }

  const currencySymbol = 'USDC'
  const imageUrl = 'https://assets.coingecko.com/coins/images/6319/small/USD_Coin_icon.png?1547042389'
  
  return (
    <Box
      paddingX="5"
      paddingBottom="5"
      style={{
        marginTop: HEADER_HEIGHT
      }}
    >
      <Text>
        Order summary
      </Text>      
      <Box>
        Summary item box
      </Box>
      <Divider />

      {displayCryptoCheckout && (
        <Box>
          <Text>
            Total
          </Text>
          <Box>
            currency required...
          </Box>
        </Box>
      )}

      <Box
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        gap="2"
      >
        {displayCreditCardCheckout && (
          <Button
            style={{
              borderRadius: vars.radii.md,
              height: '56px'
            }}
            width="full"
            borderRadius="md"
            leftIcon={PaymentsIcon}
            variant="primary"
            label="Pay with credit card"
            rightIcon={ChevronRightIcon}
            onClick={onClickPayWithCard}
          />
        )}
        {displayCryptoCheckout && (
          <Button
            style={{
              borderRadius: vars.radii.md,
              height: '56px'
            }}
            width="full"
            leftIcon={() => <CoinIcon size={20} imageUrl={imageUrl} />}
            variant="primary"
            label={`Pay with ${currencySymbol}`}
            rightIcon={ChevronRightIcon}
            onClick={onClickPayWithCrypto}
          />
        )}
      </Box>
      {displayCryptoCheckout && (
        <Box>
          <Text>Balance: ....</Text>
        </Box>
      )}
    </Box>
  )
}
