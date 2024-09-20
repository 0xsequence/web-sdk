import {
  useState,
  useEffect,
  memo
} from 'react'

import {
  useBalances,
  useContractInfo,
  useSwapQuotes,
  compareAddress,
  TRANSACTION_CONFIRMATIONS_DEFAULT,
  sendTransactions,
  SwapQuotesWithCurrencyInfo
} from '@0xsequence/kit'
import {
  Box,
  Button,
  Text,
  TextInput,
  SearchIcon,
  Scroll,
  Spinner,
} from '@0xsequence/design-system'
import { encodeFunctionData, formatUnits, Hex } from 'viem'

import { SelectPaymentSettings } from '../../../contexts'

import { findSupportedNetwork } from '@0xsequence/network'

import { usePublicClient, useWalletClient, useReadContract, useAccount } from 'wagmi'

import { CryptoOption } from './CryptoOption'
import { getCardHeight } from '../../../utils/sizing'
import { ERC_20_CONTRACT_ABI } from '../../../constants/abi'
import { useClearCachedBalances, useSelectPaymentModal } from '../../../hooks'

interface PayWithCryptoProps {
  settings: SelectPaymentSettings
  disableButtons: boolean
  setDisableButtons: React.Dispatch<React.SetStateAction<boolean>>
}

export const PayWithCrypto = ({
  settings,
  disableButtons,
  setDisableButtons
}: PayWithCryptoProps) => {
  const { enableSwapPayments = true, enableMainCurrencyPayment = true } = settings
  const [search, setSearch] = useState('')
  const [selectedCurrency, setSelectedCurrency] = useState<string>() 

  const {
    chain,
    currencyAddress,
    targetContractAddress,
    price,
    txData,
    transactionConfirmations = TRANSACTION_CONFIRMATIONS_DEFAULT,
    onSuccess = () => {},
    onError = () => {},
  } = settings
  const { address: userAddress, connector } = useAccount()
  const { data: walletClient } = useWalletClient()
  const publicClient = usePublicClient()
  const { clearCachedBalances } = useClearCachedBalances()
  const { closeSelectPaymentModal } = useSelectPaymentModal()
  const network = findSupportedNetwork(chain)
  const chainId = network?.chainId || 137

  const {
    data: allowanceData,
    isLoading: allowanceIsLoading,
    refetch: refechAllowance
  } = useReadContract({
    abi: ERC_20_CONTRACT_ABI,
    functionName: 'allowance',
    chainId: chainId,
    address: currencyAddress as Hex,
    args: [userAddress, targetContractAddress],
    query: {
      enabled: !!userAddress
    }
  })

  const { data: currencyBalanceData, isLoading: currencyBalanceIsLoading } = useBalances({
    chainIds: [chainId],
    contractAddress: currencyAddress,
    accountAddress: userAddress || '',
    // includeMetadata must be false to work around a bug
    includeMetadata: false
  })

  const { data: currencyInfoData, isLoading: isLoadingCurrencyInfo } = useContractInfo(
    chainId,
    currencyAddress
  )

  const { data: swapQuotes, isLoading: swapQuotesIsLoading } = useSwapQuotes({
    userAddress: userAddress ?? '',
    currencyAddress: settings?.currencyAddress,
    chainId: chainId,
    currencyAmount: price,
    withContractInfo: true
  })

  const isLoading = allowanceIsLoading || currencyBalanceIsLoading ||isLoadingCurrencyInfo || swapQuotesIsLoading

  const priceFormatted = formatUnits(BigInt(price), currencyInfoData?.decimals || 0)
  const isApproved: boolean = (allowanceData as bigint) >= BigInt(price)

  const balanceInfo = currencyBalanceData?.find(balanceData => compareAddress(currencyAddress, balanceData.contractAddress))

  const balance: bigint = BigInt(balanceInfo?.balance || '0')
  let balanceFormatted = Number(formatUnits(balance, currencyInfoData?.decimals || 0))
  balanceFormatted = Math.trunc(Number(balanceFormatted) * 10000) / 10000

  const isNotEnoughFunds: boolean = BigInt(price) > balance

  useEffect(() => {
    clearCachedBalances()
  }, [])

  const onPurchaseMainCurrency = async () => {
    if (!walletClient || !userAddress || !publicClient || !userAddress || !connector) {
      return
    }

    setDisableButtons(true)

    try {
      const walletClientChainId = await walletClient.getChainId()
      if (walletClientChainId !== chainId) {
        await walletClient.switchChain({ id: chainId })
      }

      const approveTxData = encodeFunctionData({
        abi: ERC_20_CONTRACT_ABI,
        functionName: 'approve',
        args: [targetContractAddress, price]
      })


      const transactions = [
        ...(isApproved
          ? []
          : [
              {
                to: currencyAddress as Hex,
                data: approveTxData,
                chainId
              }
            ]),
        {
          to: targetContractAddress as Hex,
          data: txData,
          chainId
        }
      ]

      const txHash = await sendTransactions({
        chainId,
        senderAddress: userAddress,
        publicClient,
        walletClient,
        connector,
        transactions,
        transactionConfirmations,
      })

      closeSelectPaymentModal()
      refechAllowance()
      clearCachedBalances()
      onSuccess(txHash)
    } catch (e) {
      console.error('Failed to purchase...', e)
      onError(e as Error)
    }

    setDisableButtons(false)
  }

  const onClickPurchaseSwap = async (swapQuote: SwapQuotesWithCurrencyInfo) => {
    if (!walletClient || !userAddress || !publicClient || !userAddress || !connector) {
      return
    }

    const swapQuoteAddress = swapQuote.info?.address || ''

    setDisableButtons(true)

    try {
      const walletClientChainId = await walletClient.getChainId()
      if (walletClientChainId !== chainId) {
        await walletClient.switchChain({ id: chainId })
      }

      const approveTxData = encodeFunctionData({
        abi: ERC_20_CONTRACT_ABI,
        functionName: 'approve',
        args: [targetContractAddress, price]
      })

      const transactions = [
        // Swap quote optional approve step
        ...(swapQuote.quote.approveData
          ? [
              {
                to: swapQuote.quote.currencyAddress as Hex,
                data: swapQuote.quote.approveData as Hex,
                chain: chainId
              }
            ]
          : []),
        // Swap quote tx
        {
          to: swapQuote.quote.to as Hex,
          data: swapQuote.quote.transactionData as Hex,
          chain: chainId
        },
        // Actual transaction optional approve step
        ...(isApproved
          ? []
          : [
              {
                to: currencyAddress as  Hex,
                data: approveTxData as Hex,
                chainId: chainId
              }
          ]
        ),
        // transaction on the contract
        {
          to: targetContractAddress  as  Hex,
          data: txData as Hex,
          chainId
        }
      ]

      const txHash = await sendTransactions({
        chainId,
        senderAddress: userAddress,
        publicClient,
        walletClient,
        connector,
        transactions,
        transactionConfirmations,
      })

      closeSelectPaymentModal()
      refechAllowance()
      clearCachedBalances()
      onSuccess(txHash)
    } catch (e) {
      console.error('Failed to purchase...', e)
      onError(e as Error)
    }

    setDisableButtons(false)
  }

  const Options = () => {
    return (
      <Box flexDirection="column" justifyContent="center" alignItems="center" gap="2" width="full">
        {enableMainCurrencyPayment && (
          <CryptoOption
            key={currencyAddress}
            currencyName={currencyInfoData?.name || 'Unknown'}
            chainId={chainId}
            iconUrl={currencyInfoData?.logoURI}
            symbol={currencyInfoData?.symbol || ''}
            onClick={() => {
              setSelectedCurrency(currencyAddress)
            }}
            balance={String(balanceFormatted)}
            price={priceFormatted}
            fiatPrice="5"
            disabled={disableButtons}
            isSelected={selectedCurrency === currencyAddress}
            isInsufficientFunds={isNotEnoughFunds}
          />
        )}
        {enableSwapPayments && (
          swapQuotes?.map((swapQuote, index) => {
            const swapQuotePriceFormatted = formatUnits(BigInt(swapQuote.quote.price), swapQuote.info?.decimals || 18)
            const balanceFormatted = formatUnits(BigInt(swapQuote.balance?.balance || 0), swapQuote.info?.decimals || 18)
            const swapQuoteAddress = swapQuote.info?.address || ''
            const currencyInfoNotFound = !swapQuote.info || swapQuote?.info?.decimals === undefined || !swapQuote.balance?.balance
        
            if (currencyInfoNotFound) {
              return null
            }

            return (
              <CryptoOption
                key={swapQuoteAddress}
                currencyName={swapQuote.info?.name || 'Unknown'}
                chainId={chainId}
                iconUrl={swapQuote.info?.logoURI}
                symbol={swapQuote.info?.symbol || ''}
                onClick={() => {
                  setSelectedCurrency(swapQuoteAddress)
                }}
                balance={String(Number(balanceFormatted).toPrecision(4))}
                price={String(Number(swapQuotePriceFormatted).toPrecision(4))}
                fiatPrice="5"
                disabled={disableButtons}
                isSelected={selectedCurrency === swapQuoteAddress}
                isInsufficientFunds={false}
              />
            )
          })
        )}
      </Box>
    )
  }


  const onClickPurchase = () => {

  }

  return (
    <Box>
      <Box width="full" marginTop="4">
        <TextInput
          autoFocus
          name="Search"
          leftIcon={SearchIcon}
          value={search}
          onChange={ev => setSearch(ev.target.value)}
          placeholder="Search your wallet"
          data-1p-ignore
        />
      </Box>
      <Box marginTop="3" >
        <Text
          variant="small"
          fontWeight="medium"
          color="text50"
        >
          Select a crypto
        </Text>
      </Box>
      <Scroll paddingTop="3" style={{ height: '285px' }}>
        {isLoading ? (
          <Box width="full" paddingTop="5" justifyContent="center" alignItems="center">
            <Spinner />
          </Box>
        ) : (
          <Options />
        )}
      </Scroll>
      <Button
        onClick={() => {

        }}
        disabled={isLoading || disableButtons || !selectedCurrency}
        marginTop="2"
        shape="square"
        variant="primary"
        width="full"
        label="Complete Purchase"
      />
    </Box>
  )
}