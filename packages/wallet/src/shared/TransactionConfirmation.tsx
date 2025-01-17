import { Box, Button, ChevronRightIcon, Text, vars, Card, GradientAvatar, Spinner } from '@0xsequence/design-system'
import { useIndexerClient } from '@0xsequence/kit'
import { useQuery } from '@tanstack/react-query'
import React, { useState } from 'react'
import { useAccount } from 'wagmi'

import { truncateAtMiddle } from '../utils'

import { FeeOption, FeeOptionSelector } from './FeeOptionSelector'
import { SendItemInfo } from './SendItemInfo'

interface TransactionConfirmationProps {
  // Display data
  name: string
  symbol: string
  imageUrl?: string
  amount: string
  toAddress: string
  showSquareImage?: boolean
  fiatValue?: string
  chainId: number
  balance: string
  decimals: number
  feeOptions?: {
    options: FeeOption[]
    chainId: number
  }
  onSelectFeeOption?: (feeTokenAddress: string | null) => void
  isLoading?: boolean

  // Callbacks
  onConfirm: () => void
  onCancel: () => void
}

const useFeeOptionBalances = (feeOptions: TransactionConfirmationProps['feeOptions'], chainId: number) => {
  const { address: accountAddress } = useAccount()
  const indexerClient = useIndexerClient(chainId)

  return useQuery({
    queryKey: ['feeOptionBalances', chainId, accountAddress, feeOptions?.options?.length],
    queryFn: async () => {
      if (!feeOptions?.options || !accountAddress || !indexerClient) return []

      const nativeTokenBalance = await indexerClient.getEtherBalance({
        accountAddress
      })

      const tokenBalances = await indexerClient.getTokenBalances({
        accountAddress
      })

      return feeOptions.options.map(option => {
        if (option.token.contractAddress === null) {
          return {
            tokenName: option.token.name,
            decimals: option.token.decimals || 0,
            balance: nativeTokenBalance.balance.balanceWei
          }
        } else {
          return {
            tokenName: option.token.name,
            decimals: option.token.decimals || 0,
            balance:
              tokenBalances.balances.find(b => b.contractAddress.toLowerCase() === option.token.contractAddress?.toLowerCase())
                ?.balance || '0'
          }
        }
      })
    },
    enabled: Boolean(feeOptions?.options && accountAddress && indexerClient),
    refetchInterval: 10000,
    staleTime: 10000
  })
}

export const TransactionConfirmation = ({
  name,
  symbol,
  imageUrl,
  amount,
  toAddress,
  showSquareImage,
  fiatValue,
  chainId,
  balance,
  decimals,
  feeOptions,
  onSelectFeeOption,
  isLoading,
  onConfirm,
  onCancel
}: TransactionConfirmationProps) => {
  const [selectedFeeOptionAddress, setSelectedFeeOptionAddress] = useState<string>()
  const { data: feeOptionBalances = [] } = useFeeOptionBalances(feeOptions, chainId)

  const handleFeeOptionSelect = (address: string) => {
    setSelectedFeeOptionAddress(address)
    onSelectFeeOption?.(address)
  }

  // If feeOptions exist and have options, a selection is required
  // If feeOptions don't exist or have no options, no selection is required
  const isFeeSelectionRequired = Boolean(feeOptions?.options?.length)
  const isConfirmDisabled = isFeeSelectionRequired && !selectedFeeOptionAddress

  return (
    <Box width="full" height="full" display="flex" alignItems="center" justifyContent="center" background="backgroundPrimary">
      <Box gap="2" flexDirection="column" background="backgroundPrimary" width="full">
        <Box background="backgroundSecondary" borderRadius="md" padding="4" paddingBottom="3" gap="2" flexDirection="column">
          <SendItemInfo
            imageUrl={imageUrl}
            showSquareImage={showSquareImage}
            name={name}
            symbol={symbol}
            chainId={chainId}
            balance={balance}
            decimals={decimals}
          />

          <Box marginTop="2" gap="1" flexDirection="column">
            <Text variant="small" color="text50">
              Amount
            </Text>
            <Box flexDirection="row" alignItems="center" gap="2">
              <Text variant="normal" color="text100">
                {amount} {symbol}
              </Text>
              {fiatValue && (
                <Text variant="small" color="text50">
                  ~${fiatValue}
                </Text>
              )}
            </Box>
          </Box>

          <Box marginTop="2" gap="1" flexDirection="column">
            <Text variant="small" color="text50">
              To
            </Text>
            <Card width="full" flexDirection="row" alignItems="center" style={{ height: '52px' }}>
              <Box flexDirection="row" justifyContent="center" alignItems="center" gap="2">
                <GradientAvatar address={toAddress} style={{ width: '20px' }} />
                <Text color="text100" variant="normal">{`0x${truncateAtMiddle(toAddress.substring(2), 10)}`}</Text>
              </Box>
            </Card>
          </Box>

          {isFeeSelectionRequired && feeOptions?.options && (
            <FeeOptionSelector
              txnFeeOptions={feeOptions.options}
              feeOptionBalances={feeOptionBalances}
              selectedFeeOptionAddress={selectedFeeOptionAddress}
              setSelectedFeeOptionAddress={handleFeeOptionSelect}
            />
          )}
        </Box>

        <Box marginTop="3" gap="2">
          {isLoading ? (
            <Box width="full" style={{ height: '52px' }} alignItems="center" justifyContent="center">
              <Spinner />
            </Box>
          ) : (
            <>
              <Button
                width="full"
                variant="primary"
                onClick={onConfirm}
                label="Confirm"
                rightIcon={ChevronRightIcon}
                disabled={isConfirmDisabled}
                style={{ height: '52px', borderRadius: vars.radii.md }}
              />
              <Button
                variant="glass"
                width="full"
                onClick={onCancel}
                label="Cancel"
                style={{ height: '52px', borderRadius: vars.radii.md }}
              />
            </>
          )}
        </Box>
      </Box>
    </Box>
  )
}
