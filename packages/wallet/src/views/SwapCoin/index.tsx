import { Button, ChevronRightIcon, Text, NumericInput } from '@0xsequence/design-system';
import { ContractVerificationStatus, TokenBalance } from '@0xsequence/indexer'
import { compareAddress, getNativeTokenInfoByChainId, useExchangeRate, useCoinPrices, useBalancesSummary } from '@0xsequence/kit'
import { ethers } from 'ethers'
import { useRef, useState, ChangeEvent } from 'react'
import { useAccount, useConfig } from 'wagmi'

import { HEADER_HEIGHT } from '../../constants'
import { useSettings, useNavigation } from '../../hooks'
import { SendItemInfo } from '../../shared/SendItemInfo'
import { computeBalanceFiat, limitDecimals } from '../../utils'

export interface SwapCoinProps {
  contractAddress: string
  chainId: number
}

export const SwapCoin = ({ contractAddress, chainId }: SwapCoinProps) => {
  const { setNavigation } = useNavigation()
  const { chains } = useConfig()
  const { address: accountAddress = '' } = useAccount()

  const amountInputRef = useRef<HTMLInputElement>(null)
  const { fiatCurrency } = useSettings()
  const [amount, setAmount] = useState<string>('0')

  const { data: balances = [], isPending: isPendingBalances } = useBalancesSummary({
    chainIds: [chainId],
    filter: {
      accountAddresses: [accountAddress],
      contractStatus: ContractVerificationStatus.ALL,
      contractWhitelist: [contractAddress],
      omitNativeBalances: true
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
    <form
      className="flex p-5 gap-2 flex-col"
      onSubmit={handleFindQuotesClick}
      style={{
        marginTop: HEADER_HEIGHT
      }}>
      <div className="flex bg-background-secondary rounded-xl p-4 gap-2 flex-col">
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
              <Text className="whitespace-nowrap" variant="small" color="text50">
                {`~${fiatCurrency.sign}${amountToSendFiat}`}
              </Text>
              <Button className="shrink-0" size="xs" shape="square" label="Max" onClick={handleMax} data-id="maxCoin" />
              <Text variant="xlarge" fontWeight="bold" color="text100">
                {symbol}
              </Text>
            </>
          }
        />
      </div>
      <div className="flex items-center justify-center" style={{ height: '52px' }}>
        <Button
          className="text-text100 mt-3 w-full"
          variant="primary"
          type="submit"
          disabled={!isNonZeroAmount}
          label="Continue"
          rightIcon={ChevronRightIcon}
          style={{ height: '52px', borderRadius: vars.radii.md }} />
      </div>
    </form>
  );
}
