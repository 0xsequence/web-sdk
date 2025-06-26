import { compareAddress, ContractVerificationStatus, formatDisplay } from '@0xsequence/connect'
import { Card, Scroll, SearchInput, Spinner, Text, TokenImage } from '@0xsequence/design-system'
import { useGetContractInfo, useGetSwapRoutes, useGetTokenBalancesSummary } from '@0xsequence/hooks'
import { findSupportedNetwork } from '@0xsequence/network'
import Fuse from 'fuse.js'
import { useState } from 'react'
import { formatUnits } from 'viem'

import { HEADER_HEIGHT } from '../../../constants/index.js'
import { type TokenSelection } from '../../../contexts/NavigationCheckout.js'
import { useNavigationCheckout } from '../../../hooks/useNavigationCheckout.js'
import { useSelectPaymentModal } from '../../../hooks/useSelectPaymentModal.js'

export const TokenSelectionContent = () => {
  const [search, setSearch] = useState('')
  const { navigation, setHistory } = useNavigationCheckout()

  const { selectedCurrency } = navigation.params as TokenSelection['params']

  const { selectPaymentSettings } = useSelectPaymentModal()

  const { chain, currencyAddress, recipientAddress, price } = selectPaymentSettings!
  const network = findSupportedNetwork(chain)
  const chainId = network?.chainId || 137

  const { data: currencyInfoData, isLoading: isLoadingCurrencyInfo } = useGetContractInfo({
    chainID: String(chainId),
    contractAddress: currencyAddress
  })

  const { data: swapRoutes = [], isLoading: swapRoutesIsLoading } = useGetSwapRoutes(
    {
      walletAddress: recipientAddress ?? '',
      chainId,
      toTokenAmount: price,
      toTokenAddress: currencyAddress
    },
    { retry: 3 }
  )

  const { data: currencyBalanceDataPaginated, isLoading: currencyBalanceIsLoading } = useGetTokenBalancesSummary({
    chainIds: [chainId],
    filter: {
      accountAddresses: recipientAddress ? [recipientAddress] : [],
      contractStatus: ContractVerificationStatus.ALL,
      contractWhitelist: [currencyAddress, ...swapRoutes.flatMap(swapRoute => swapRoute.fromTokens.map(token => token.address))],
      omitNativeBalances: false
    },
    omitMetadata: true
  })

  const currencyBalanceData = currencyBalanceDataPaginated?.pages?.flatMap(page => page.balances)

  const isLoading = isLoadingCurrencyInfo || swapRoutesIsLoading || currencyBalanceIsLoading

  interface Token {
    name: string
    symbol: string
    chainId: number
    contractAddress: string
  }
  const allTokens: Token[] = [
    {
      name: currencyInfoData?.name || '',
      symbol: currencyInfoData?.symbol || '',
      chainId,
      contractAddress: currencyAddress
    },
    ...(swapRoutes?.[0]?.fromTokens?.map(token => ({
      name: token.name,
      symbol: token.symbol,
      chainId: token.chainId,
      contractAddress: token.address
    })) || [])
  ]

  const fuzzyTokens = new Fuse(allTokens, {
    keys: ['name', 'symbol']
  })
  const foundTokens = fuzzyTokens.search(search)
  const displayedTokens = search === '' ? allTokens : foundTokens.map(token => token.item)

  const TokenOptions = () => {
    if (displayedTokens.length == 0) {
      return (
        <div className="flex flex-col gap-[6px] mt-4 justify-center items-center">
          <Text color="text100" variant="small" fontWeight="normal">
            No tokens found
          </Text>
        </div>
      )
    }

    return (
      <div className="flex flex-col gap-[6px]">
        {displayedTokens.map(token => {
          const isMainToken = compareAddress(token.contractAddress, currencyAddress)
          const tokenInfo = isMainToken
            ? currencyInfoData
            : swapRoutes[0].fromTokens.find(t => compareAddress(t.address, token.contractAddress))

          const logoUrl = tokenInfo && 'logoURI' in tokenInfo ? tokenInfo.logoURI : tokenInfo?.logoUri

          const isSelected =
            chainId == selectedCurrency.chainId && compareAddress(selectedCurrency.address, token.contractAddress)
          const balanceRaw =
            currencyBalanceData?.find(balance => compareAddress(balance.contractAddress, token.contractAddress))?.balance || '0'

          return (
            <TokenOption
              key={token.contractAddress}
              tokenName={tokenInfo?.name || ''}
              chainId={token.chainId}
              balanceRaw={balanceRaw}
              decimals={tokenInfo?.decimals || 0}
              logoUrl={logoUrl || ''}
              symbol={tokenInfo?.symbol || ''}
              isSelected={isSelected}
              onClick={() => {
                setHistory([
                  {
                    location: 'payment-method-selection',
                    params: {
                      selectedCurrency: {
                        address: token.contractAddress,
                        chainId: token.chainId
                      }
                    }
                  }
                ])
              }}
            />
          )
        })}
      </div>
    )
  }

  return (
    <div
      className="px-3 pb-3 h-full w-full"
      style={{
        paddingTop: HEADER_HEIGHT
      }}
    >
      <div className="flex justify-center items-center mb-4">
        <Text color="text100" variant="normal" fontWeight="bold">
          Select token
        </Text>
      </div>
      <div className="flex flex-col gap-2 h-full">
        <SearchInput
          className="w-full"
          width="full"
          name="search"
          placeholder="Search"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        {isLoading && (
          <div className="w-full h-full mt-4 flex justify-center items-center">
            <Spinner />
          </div>
        )}
        {!isLoading && (
          <Scroll shadows={false} className="h-[206px] scrollbar-color-gray-black scrollbar-width-thin">
            <TokenOptions />
          </Scroll>
        )}
      </div>
    </div>
  )
}

interface TokenOptionProps {
  tokenName: string
  chainId: number
  balanceRaw: string
  decimals: number
  logoUrl: string
  symbol: string
  isSelected: boolean
  onClick: () => void
}

const TokenOption = ({ tokenName, chainId, balanceRaw, decimals, logoUrl, symbol, onClick }: TokenOptionProps) => {
  const network = findSupportedNetwork(chainId)
  const formattedBalance = formatUnits(BigInt(balanceRaw), decimals)
  const displayBalance = formatDisplay(formattedBalance, {
    disableScientificNotation: true,
    disableCompactNotation: true,
    significantDigits: 6
  })

  return (
    <Card
      clickable
      className="select-none p-3 flex flex-row justify-between items-center cursor-pointer border-1 border-transparent hover:border-[var(--seq-color-border-normal)]"
      onClick={onClick}
    >
      <div className="flex flex-row gap-2 items-center">
        <TokenImage disableAnimation src={logoUrl} withNetwork={chainId} className="w-6 h-6" />
        <div className="flex flex-col gap-0">
          <div className="flex flex-row gap-1">
            <Text color="text80" variant="small" fontWeight="bold">
              {tokenName}
            </Text>
            <Text color="text50" variant="xsmall" fontWeight="bold">
              on {network?.title}
            </Text>
          </div>
          <Text color="text50" variant="xsmall" fontWeight="normal">
            Balance: {displayBalance} {symbol}
          </Text>
        </div>
      </div>
    </Card>
  )
}
