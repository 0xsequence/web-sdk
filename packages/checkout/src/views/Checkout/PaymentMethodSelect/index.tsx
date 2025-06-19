import type { LifiToken } from '@0xsequence/api'
import { compareAddress, sendTransactions, TRANSACTION_CONFIRMATIONS_DEFAULT, useAnalyticsContext } from '@0xsequence/connect'
import { Button, Divider, Spinner, Tabs, TabsContent, TabsHeader, TabsRoot, Text } from '@0xsequence/design-system'
import {
  useClearCachedBalances,
  useGetContractInfo,
  useGetSwapQuote,
  useGetSwapRoutes,
  useIndexerClient
} from '@0xsequence/hooks'
import { findSupportedNetwork } from '@0xsequence/network'
import { useEffect, useState, useRef } from 'react'
import { encodeFunctionData, formatUnits, zeroAddress, type Hex } from 'viem'
import { useAccount, usePublicClient, useReadContract, useWalletClient } from 'wagmi'

import { NavigationHeaderCheckout } from '../../../components/NavigationHeaderCheckout.js'
import { ERC_20_CONTRACT_ABI } from '../../../constants/abi.js'
import { EVENT_SOURCE, HEADER_HEIGHT } from '../../../constants/index.js'
import type { SelectPaymentSettings } from '../../../contexts/SelectPaymentModal.js'
import { useSelectPaymentModal, useSkipOnCloseCallback, useTransactionStatusModal } from '../../../hooks/index.js'
import { useNavigationCheckout } from '../../../hooks/useNavigationCheckout.js'

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

  const [selectedTab, setSelectedTab] = useState<Tab>('crypto')
  const isFirstRender = useRef<boolean>(true)
  const {
    chain,
    collectibles,
    collectionAddress,
    currencyAddress,
    targetContractAddress,
    approvedSpenderAddress,
    price,
    txData,
    enableTransferFunds = true,
    enableMainCurrencyPayment = true,
    enableSwapPayments = true,
    creditCardProviders = [],
    transactionConfirmations = TRANSACTION_CONFIRMATIONS_DEFAULT,
    onRampProvider,
    onSuccess = () => {},
    onError = () => {},
    onClose = () => {},
    supplementaryAnalyticsInfo,
    slippageBps
  } = selectPaymentSettings

  const { clearCachedBalances } = useClearCachedBalances()

  useEffect(() => {
    clearCachedBalances()
  }, [])

  const validCreditCardProviders = creditCardProviders.filter(provider => {
    if (provider === 'transak') {
      return !!selectPaymentSettings?.transakConfig
    }
    return true
  })

  const isTokenIdUnknown = collectibles.some(collectible => !collectible.tokenId)

  const showCreditCardPayment = validCreditCardProviders.length > 0 && !isTokenIdUnknown

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
          className="w-full"
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
              <PayWithCryptoTab />
            </TabWrapper>
          </TabsContent>
          <TabsContent value="credit-card">
            <TabWrapper>
              <PayWithCreditCardTab />
            </TabWrapper>
          </TabsContent>
        </TabsRoot>
      </div>
    </>
  )
}
