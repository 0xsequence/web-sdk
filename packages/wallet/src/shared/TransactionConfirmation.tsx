import { Button, ChevronRightIcon, Text, Card, GradientAvatar, Spinner } from '@0xsequence/design-system'
import { truncateAtMiddle, useIndexerClient } from '@0xsequence/kit'
import { useQuery } from '@tanstack/react-query'
import React, { useState } from 'react'
import { useAccount } from 'wagmi'

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
    <div className="flex w-full h-full items-center justify-center bg-background-primary">
      <div className="flex gap-2 flex-col bg-background-primary w-full">
        <div className="flex bg-background-secondary rounded-xl p-4 pb-3 gap-2 flex-col">
          <SendItemInfo
            imageUrl={imageUrl}
            showSquareImage={showSquareImage}
            name={name}
            symbol={symbol}
            chainId={chainId}
            balance={balance}
            decimals={decimals}
          />

          <div className="flex mt-2 gap-1 flex-col">
            <Text variant="small" color="muted">
              Amount
            </Text>
            <div className="flex flex-row items-center gap-2">
              <Text variant="normal" color="primary">
                {amount} {symbol}
              </Text>
              {fiatValue && (
                <Text variant="small" color="muted">
                  ~${fiatValue}
                </Text>
              )}
            </div>
          </div>

          <div className="flex mt-2 gap-1 flex-col">
            <Text variant="small" color="muted">
              To
            </Text>
            <Card className="flex w-full flex-row items-center" style={{ height: '52px' }}>
              <div className="flex flex-row justify-center items-center gap-2">
                <GradientAvatar size="sm" address={toAddress} />
                <Text color="primary" variant="normal">{`0x${truncateAtMiddle(toAddress.substring(2), 10)}`}</Text>
              </div>
            </Card>
          </div>

          {isFeeSelectionRequired && feeOptions?.options && (
            <FeeOptionSelector
              txnFeeOptions={feeOptions.options}
              feeOptionBalances={feeOptionBalances}
              selectedFeeOptionAddress={selectedFeeOptionAddress}
              setSelectedFeeOptionAddress={handleFeeOptionSelect}
            />
          )}
        </div>

        <div className="flex mt-3 gap-2">
          {isLoading ? (
            <div className="flex w-full items-center justify-center" style={{ height: '52px' }}>
              <Spinner />
            </div>
          ) : (
            <>
              <Button
                className="w-full"
                variant="primary"
                size="lg"
                onClick={onConfirm}
                label="Confirm"
                rightIcon={ChevronRightIcon}
                disabled={isConfirmDisabled}
              />
              <Button className="w-full" variant="glass" size="lg" onClick={onCancel} label="Cancel" />
            </>
          )}
        </div>
      </div>
    </div>
  )
}
