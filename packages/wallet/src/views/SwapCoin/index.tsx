import { ethers } from 'ethers'
import { useRef, useState, useEffect, ChangeEvent } from 'react'
import {
  Box,
  Button,
  ChevronRightIcon,
  CloseIcon,
  CopyIcon,
  GradientAvatar,
  Spinner,
  Text,
  NumericInput,
  SearchIcon,
  TextInput,
  vars,
  Card
} from '@0xsequence/design-system'
import { ContractVerificationStatus, TokenBalance } from '@0xsequence/indexer'

import {
  compareAddress,
  getNativeTokenInfoByChainId,
  useAnalyticsContext,
  ExtendedConnector,
  useExchangeRate,
  useCoinPrices,
  useBalancesSummary
} from '@0xsequence/kit'
import { useAccount, useChainId, useSwitchChain, useConfig, useSendTransaction } from 'wagmi'

import { HEADER_HEIGHT } from '../../constants'
import { useNavigationContext } from '../../contexts/Navigation'
import { useSettings, useNavigation } from '../../hooks'
import { SendItemInfo } from '../../shared/SendItemInfo'
import { computeBalanceFiat, limitDecimals } from '../../utils'

export interface SwapCoinProps {
  contractAddress: string
  chainId: number
}

export const SwapCoin = ({ contractAddress, chainId }: SwapCoinProps) => {
  const { setNavigation } = useNavigation()
  const { setIsBackButtonEnabled } = useNavigationContext()
  const { analytics } = useAnalyticsContext()
  const { chains } = useConfig()
  const connectedChainId = useChainId()
  const { address: accountAddress = '', connector } = useAccount()
  const isConnectorSequenceBased = !!(connector as ExtendedConnector)?._wallet?.isSequenceBased
  const isCorrectChainId = connectedChainId === chainId
  const showSwitchNetwork = !isCorrectChainId && !isConnectorSequenceBased
  const { switchChainAsync } = useSwitchChain()
  const amountInputRef = useRef<HTMLInputElement>(null)
  const { fiatCurrency } = useSettings()
  const [amount, setAmount] = useState<string>('0')
  const { sendTransaction } = useSendTransaction()
  const [isSendTxnPending, setIsSendTxnPending] = useState(false)

  const [isCheckingFeeOptions, setIsCheckingFeeOptions] = useState(false)

  const { data: balances = [], isPending: isPendingBalances } = useBalancesSummary({
    chainIds: [chainId],
    filter: {
      accountAddresses: [accountAddress],
      contractStatus: ContractVerificationStatus.ALL,
      contractWhitelist: [contractAddress],
      contractBlacklist: []
    }
  })
  const nativeTokenInfo = getNativeTokenInfoByChainId(chainId, chains)
  const tokenBalance = (balances as TokenBalance[]).find(b => b.contractAddress === contractAddress)
  const { data: coinPrices = [], isPending: isPendingCoinPrices } = useCoinPrices([
    {
      chainId,
      contractAddress
    }
  ])

  const { data: conversionRate = 1, isPending: isPendingConversionRate } = useExchangeRate(fiatCurrency.symbol)

  const isPending = isPendingBalances || isPendingCoinPrices || isPendingConversionRate

  const handleChangeAmount = (ev: ChangeEvent<HTMLInputElement>) => {
    const { value } = ev.target

    // Prevent value from having more decimals than the token supports
    const formattedValue = limitDecimals(value, decimals)

    setAmount(formattedValue)
  }

  const handleMax = () => {
    amountInputRef.current?.focus()
    const maxAmount = ethers.formatUnits(tokenBalance?.balance || 0, decimals).toString()

    setAmount(maxAmount)
  }

  const handleFindQuotesClick = (e: ChangeEvent<HTMLFormElement>) => {
    e.preventDefault()
    setNavigation({
      location: 'swap-coin-list',
      params: {
        chainId,
        contractAddress,
        amount: amountRaw.toString()
      }
    })
  }

  if (isPending) {
    return null
  }

  const isNativeCoin = compareAddress(contractAddress, ethers.ZeroAddress)
  const decimals = isNativeCoin ? nativeTokenInfo.decimals : tokenBalance?.contractInfo?.decimals || 18
  const name = isNativeCoin ? nativeTokenInfo.name : tokenBalance?.contractInfo?.name || ''
  const imageUrl = isNativeCoin ? nativeTokenInfo.logoURI : tokenBalance?.contractInfo?.logoURI
  const symbol = isNativeCoin ? nativeTokenInfo.symbol : tokenBalance?.contractInfo?.symbol || ''
  const amountToSendFormatted = amount === '' ? '0' : amount
  const amountRaw = ethers.parseUnits(amountToSendFormatted, decimals)

  const amountToSendFiat = computeBalanceFiat({
    balance: {
      ...(tokenBalance as TokenBalance),
      balance: amountRaw.toString()
    },
    prices: coinPrices,
    conversionRate,
    decimals
  })

  const isNonZeroAmount = amountRaw > 0n

  return (
    <Box
      padding="5"
      gap="2"
      flexDirection="column"
      as="form"
      onSubmit={handleFindQuotesClick}
      pointerEvents={isSendTxnPending ? 'none' : 'auto'}
      style={{
        marginTop: HEADER_HEIGHT
      }}
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
              <Text variant="xlarge" fontWeight="bold" color="text100">
                {symbol}
              </Text>
            </>
          }
        />
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
        <Button
          color="text100"
          marginTop="3"
          width="full"
          variant="primary"
          type="submit"
          disabled={!isNonZeroAmount || (!isCorrectChainId && !isConnectorSequenceBased)}
          label="Continue"
          rightIcon={ChevronRightIcon}
          style={{ height: '52px', borderRadius: vars.radii.md }}
        />
      </Box>
    </Box>
  )
}
