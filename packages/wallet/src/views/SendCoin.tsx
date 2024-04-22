import React, { useState, ChangeEvent, useRef } from 'react'
import { ethers } from 'ethers'
import {
  Box,
  Button,
  ChevronRightIcon,
  CopyIcon,
  CloseIcon,
  GradientAvatar,
  Text,
  NumericInput,
  TextInput,
  vars,
  Spinner
} from '@0xsequence/design-system'
import { getNativeTokenInfoByChainId, useAnalyticsContext, ExtendedConnector } from '@0xsequence/kit'
import { TokenBalance } from '@0xsequence/indexer'
import { useAccount, useChainId, useSwitchChain, useWalletClient, useConfig, useSendTransaction } from 'wagmi'

import { SendItemInfo } from '../shared/SendItemInfo'
import { ERC_20_ABI, HEADER_HEIGHT } from '../constants'
import { useBalances, useCoinPrices, useConversionRate, useSettings, useOpenWalletModal, useNavigation } from '../hooks'
import { compareAddress, computeBalanceFiat, limitDecimals, isEthAddress, truncateAtMiddle } from '../utils'
import * as sharedStyles from '../shared/styles.css'

interface SendCoinProps {
  chainId: number
  contractAddress: string
}

export const SendCoin = ({ chainId, contractAddress }: SendCoinProps) => {
  const { setNavigation } = useNavigation()
  const { analytics } = useAnalyticsContext()
  const { chains } = useConfig()
  const connectedChainId = useChainId()
  const { address: accountAddress = '', connector } = useAccount()
  /* @ts-ignore-next-line */
  const isConnectorSequenceBased = !!connector?._wallet?.isSequenceBased
  const isCorrectChainId = connectedChainId === chainId
  const showSwitchNetwork = !isCorrectChainId && !isConnectorSequenceBased
  const { switchChainAsync } = useSwitchChain()
  const amountInputRef = useRef<HTMLInputElement>(null)
  const { setOpenWalletModal } = useOpenWalletModal()
  const { fiatCurrency } = useSettings()
  const [amount, setAmount] = useState<string>('0')
  const [toAddress, setToAddress] = useState<string>('')
  const { sendTransaction } = useSendTransaction()
  const [isSendTxnPending, setIsSendTxnPending] = useState(false)
  const { data: balances = [], isLoading: isLoadingBalances } = useBalances(
    {
      accountAddress: accountAddress,
      chainIds: [chainId],
      contractAddress
    },
    { hideUnlistedTokens: false }
  )
  const nativeTokenInfo = getNativeTokenInfoByChainId(chainId, chains)
  const tokenBalance = (balances as TokenBalance[]).find(b => b.contractAddress === contractAddress)
  const { data: coinPrices = [], isLoading: isLoadingCoinPrices } = useCoinPrices({
    tokens: [
      {
        chainId,
        contractAddress
      }
    ]
  })

  const { data: conversionRate = 1, isLoading: isLoadingConversionRate } = useConversionRate({ toCurrency: fiatCurrency.symbol })

  const isLoading = isLoadingBalances || isLoadingCoinPrices || isLoadingConversionRate

  if (isLoading) {
    return null
  }

  const isNativeCoin = compareAddress(contractAddress, ethers.constants.AddressZero)
  const decimals = isNativeCoin ? nativeTokenInfo.decimals : tokenBalance?.contractInfo?.decimals || 18
  const name = isNativeCoin ? nativeTokenInfo.name : tokenBalance?.contractInfo?.name || ''
  const imageUrl = isNativeCoin ? nativeTokenInfo.logoURI : tokenBalance?.contractInfo?.logoURI
  const symbol = isNativeCoin ? nativeTokenInfo.symbol : tokenBalance?.contractInfo?.symbol || ''
  const amountToSendFormatted = amount === '' ? '0' : amount
  const amountRaw = ethers.utils.parseUnits(amountToSendFormatted, decimals)

  const amountToSendFiat = computeBalanceFiat({
    balance: {
      ...(tokenBalance as TokenBalance),
      balance: amountRaw.toString()
    },
    prices: coinPrices,
    conversionRate,
    decimals
  })

  const insufficientFunds = amountRaw.gt(tokenBalance?.balance || '0')
  const isNonZeroAmount = amountRaw.gt(0)

  const handleChangeAmount = (ev: ChangeEvent<HTMLInputElement>) => {
    const { value } = ev.target

    // Prevent value from having more decimals than the token supports
    const formattedValue = limitDecimals(value, decimals)

    setAmount(formattedValue)
  }

  const handleMax = () => {
    amountInputRef.current?.focus()
    const maxAmount = ethers.utils.formatUnits(tokenBalance?.balance || 0, decimals).toString()

    setAmount(maxAmount)
  }

  const handlePaste = async () => {
    const result = await navigator.clipboard.readText()
    setToAddress(result)
  }

  const handleToAddressClear = () => {
    setToAddress('')
  }

  const executeTransaction = async (e: ChangeEvent<HTMLFormElement>) => {
    if (!isCorrectChainId && isConnectorSequenceBased) {
      await switchChainAsync({ chainId })
    }

    e.preventDefault()

    const sendAmount = ethers.utils.parseUnits(amountToSendFormatted, decimals)

    if (isNativeCoin) {
      analytics?.track({
        event: 'SEND_TRANSACTION_REQUEST',
        props: {
          walletClient: (connector as ExtendedConnector | undefined)?._wallet?.id || 'unknown',
          source: 'sequence-kit/wallet'
        }
      })
      setIsSendTxnPending(true)
      sendTransaction(
        {
          to: toAddress as `0x${string}}`,
          value: BigInt(sendAmount.toString()),
          gas: null
        },
        {
          onSettled: (result, error) => {
            if (result) {
              setNavigation({
                location: 'home'
              })
            }
            setIsSendTxnPending(false)
          }
        }
      )
    } else {
      analytics?.track({
        event: 'SEND_TRANSACTION_REQUEST',
        props: {
          walletClient: (connector as ExtendedConnector | undefined)?._wallet?.id || 'unknown',
          source: 'sequence-kit/wallet'
        }
      })
      setIsSendTxnPending(true)
      sendTransaction(
        {
          to: tokenBalance?.contractAddress as `0x${string}}`,
          data: new ethers.utils.Interface(ERC_20_ABI).encodeFunctionData('transfer', [
            toAddress,
            sendAmount.toHexString()
          ]) as `0x${string}`,
          gas: null
        },
        {
          onSettled: (result, error) => {
            if (result) {
              setNavigation({
                location: 'home'
              })
            }
            setIsSendTxnPending(false)
          }
        }
      )
    }
  }

  return (
    <Box
      padding="5"
      paddingTop="3"
      style={{
        marginTop: HEADER_HEIGHT
      }}
      gap="2"
      flexDirection="column"
      as="form"
      onSubmit={executeTransaction}
      pointerEvents={isSendTxnPending ? 'none' : 'auto'}
    >
      <Box background="backgroundSecondary" borderRadius="md" padding="4" gap="2" flexDirection="column">
        <SendItemInfo
          imageUrl={imageUrl}
          decimals={decimals}
          name={name}
          symbol={symbol}
          balance={tokenBalance?.balance || '0'}
          fiatValue={computeBalanceFiat({
            balance: tokenBalance as TokenBalance,
            prices: coinPrices,
            conversionRate,
            decimals
          })}
          chainId={chainId}
        />
        <NumericInput
          ref={amountInputRef}
          style={{ fontSize: vars.fontSizes.xlarge, fontWeight: vars.fontWeights.bold }}
          name="amount"
          value={amount}
          onChange={handleChangeAmount}
          controls={
            <>
              <Text variant="small" color="text50" whiteSpace="nowrap">
                {`~${fiatCurrency.sign}${amountToSendFiat}`}
              </Text>
              <Button size="xs" shape="square" label="Max" onClick={handleMax} data-id="maxCoin" flexShrink="0" />
              <Text fontSize="xlarge" fontWeight="bold" color="text100">
                {symbol}
              </Text>
            </>
          }
        />
        {insufficientFunds && (
          <Text as="div" variant="normal" color="negative" marginTop="2">
            Insufficient Funds
          </Text>
        )}
      </Box>
      <Box background="backgroundSecondary" borderRadius="md" padding="4" gap="2" flexDirection="column">
        <Text fontSize="normal" color="text50">
          To
        </Text>
        {isEthAddress(toAddress) ? (
          <Box
            borderRadius="md"
            background="backgroundSecondary"
            width="full"
            flexDirection="row"
            justifyContent="space-between"
            alignItems="center"
            padding="4"
            className={sharedStyles.clickable}
            onClick={handleToAddressClear}
            style={{ height: '52px' }}
          >
            <Box flexDirection="row" justifyContent="center" alignItems="center" gap="2">
              <GradientAvatar address={toAddress} style={{ width: '20px' }} />
              <Text color="text100">{`0x${truncateAtMiddle(toAddress.substring(2), 8)}`}</Text>
            </Box>
            <CloseIcon size="xs" />
          </Box>
        ) : (
          <TextInput
            value={toAddress}
            onChange={ev => setToAddress(ev.target.value)}
            placeholder={`${nativeTokenInfo.name} Address (0x...)`}
            name="to-address"
            data-1p-ignore
            controls={
              <Button
                size="xs"
                shape="square"
                label="Paste"
                onClick={handlePaste}
                data-id="to-address"
                flexShrink="0"
                leftIcon={CopyIcon}
              />
            }
          />
        )}
      </Box>

      {showSwitchNetwork && (
        <Box marginTop="3">
          <Text variant="small" color="negative" marginBottom="2">
            The wallet is connected to the wrong network. Please switch network before proceeding
          </Text>
          <Button
            marginTop="2"
            width="full"
            variant="primary"
            type="button"
            label="Switch Network"
            onClick={async () => await switchChainAsync({ chainId })}
            disabled={isCorrectChainId}
            style={{ height: '52px', borderRadius: vars.radii.md }}
          />
        </Box>
      )}

      <Box style={{ height: '52px' }} alignItems="center" justifyContent="center">
        {isSendTxnPending ? (
          <Spinner />
        ) : (
          <Button
            color="text100"
            marginTop="3"
            width="full"
            variant="primary"
            type="submit"
            disabled={
              !isNonZeroAmount ||
              !isEthAddress(toAddress) ||
              insufficientFunds ||
              (!isCorrectChainId && !isConnectorSequenceBased)
            }
            label="Send"
            rightIcon={ChevronRightIcon}
            style={{ height: '52px', borderRadius: vars.radii.md }}
          />
        )}
      </Box>
    </Box>
  )
}
