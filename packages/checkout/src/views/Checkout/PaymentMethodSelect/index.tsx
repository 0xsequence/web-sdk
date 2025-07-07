import { Divider, TabsContent, TabsHeader, TabsRoot, Text } from '@0xsequence/design-system'
import { useClearCachedBalances } from '@0xsequence/hooks'
import { useEffect, useRef, useState } from 'react'

import { NavigationHeaderCheckout } from '../../../components/NavigationHeaderCheckout.js'
import { HEADER_HEIGHT } from '../../../constants/index.js'
import type { SelectPaymentSettings } from '../../../contexts/SelectPaymentModal.js'
import { useSelectPaymentModal } from '../../../hooks/index.js'
import { useSkipOnCloseCallback } from '../../../hooks/useSkipOnCloseCallback.js'

import { OrderSummary } from './OrderSummary/index.js'
import { PayWithCreditCardTab } from './PayWithCreditCard/index.js'
import { PayWithCryptoTab } from './PayWithCrypto/index.js'

export const PaymentSelection = () => {
  return (
    <>
      <PaymentSelectionHeader />
      <PaymentSelectionContent />
    </>
  )
}

export const PaymentSelectionHeader = () => {
  return <NavigationHeaderCheckout primaryText="Checkout" />
}

type Tab = 'crypto' | 'credit-card'

export const PaymentSelectionContent = () => {
  const { selectPaymentSettings = {} as SelectPaymentSettings } = useSelectPaymentModal()

  const isFirstRender = useRef<boolean>(true)
  const { collectibles, creditCardProviders = [], onClose = () => {}, price } = selectPaymentSettings
  const { skipOnCloseCallback } = useSkipOnCloseCallback(onClose)

  const isFree = Number(price) == 0

  const validCreditCardProviders = creditCardProviders.filter(provider => {
    if (provider === 'transak') {
      return !!selectPaymentSettings?.transakConfig
    }
    return true
  })

  const [selectedTab, setSelectedTab] = useState<Tab>('crypto')
  const { clearCachedBalances } = useClearCachedBalances()

  useEffect(() => {
    clearCachedBalances()
  }, [])

  const isTokenIdUnknown = collectibles.some(collectible => !collectible.tokenId)

  const showCreditCardPayment = validCreditCardProviders.length > 0 && !isTokenIdUnknown && !isFree

  const tabs: { label: string; value: Tab }[] = [
    { label: 'Crypto', value: 'crypto' as Tab },
    ...(showCreditCardPayment ? [{ label: 'Credit Card', value: 'credit-card' as Tab }] : [])
  ]

  const TabWrapper = ({ children }: { children: React.ReactNode }) => {
    return <div className="w-full bg-background-secondary mt-2 p-3 rounded-xl h-[128px]">{children}</div>
  }

  return (
    <>
      <div
        className="flex flex-col gap-2 items-start w-full pb-0 px-3 h-full transition-opacity duration-200"
        style={{
          paddingTop: HEADER_HEIGHT
        }}
      >
        <div className="flex flex-col w-full gap-2 pt-2">
          <OrderSummary />
        </div>
        <div className="w-full relative">
          <div className="absolute top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2 bg-background-primary px-2">
            <Text variant="xsmall" color="text50" className="relative top-[-2px]" fontWeight="normal">
              Pay with
            </Text>
          </div>
          <Divider className="w-full" />
        </div>
        <TabsRoot
          className={'w-full'}
          value={selectedTab}
          onValueChange={value => {
            // There is a bug with the tabs components which causes the tabs
            // to change to the credit card tab upon initial mount.
            if (isFirstRender.current) {
              isFirstRender.current = false
              return
            } else {
              setSelectedTab(value as Tab)
            }
          }}
        >
          <TabsHeader tabs={tabs} value={selectedTab} />
          <TabsContent value="crypto">
            <TabWrapper>
              <PayWithCryptoTab skipOnCloseCallback={skipOnCloseCallback} />
            </TabWrapper>
          </TabsContent>
          <TabsContent value="credit-card">
            <TabWrapper>
              <PayWithCreditCardTab skipOnCloseCallback={skipOnCloseCallback} />
            </TabWrapper>
          </TabsContent>
        </TabsRoot>
      </div>
    </>
  )
}
