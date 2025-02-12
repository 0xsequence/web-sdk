import { cn, Text, TokenImage } from '@0xsequence/design-system'
import { ZeroAddress, formatUnits, parseUnits } from 'ethers'
import React from 'react'

import { Alert, AlertProps } from './Alert'

export interface FeeOption {
  token: FeeToken
  to: string
  value: string
  gasLimit: number
}
export interface FeeToken {
  chainId: number
  name: string
  symbol: string
  decimals?: number
  logoURL: string
  contractAddress?: string
  tokenID?: string
}

export interface FeeOptionBalance {
  tokenName: string
  decimals: number
  balance: string
}

export interface FeeOptionSelectorProps {
  txnFeeOptions: FeeOption[]
  feeOptionBalances: FeeOptionBalance[]
  selectedFeeOptionAddress: string | undefined
  setSelectedFeeOptionAddress: (address: string) => void
}

const isBalanceSufficient = (balance: string, fee: string, decimals: number) => {
  const balanceBN = parseUnits(balance, decimals)
  const feeBN = parseUnits(fee, decimals)
  return balanceBN >= feeBN
}

export const FeeOptionSelector: React.FC<FeeOptionSelectorProps> = ({
  txnFeeOptions,
  feeOptionBalances,
  selectedFeeOptionAddress,
  setSelectedFeeOptionAddress
}) => {
  const [feeOptionAlert, setFeeOptionAlert] = React.useState<AlertProps | undefined>()

  const sortedOptions = [...txnFeeOptions].sort((a, b) => {
    const balanceA = feeOptionBalances.find(balance => balance.tokenName === a.token.name)
    const balanceB = feeOptionBalances.find(balance => balance.tokenName === b.token.name)
    const isSufficientA = balanceA ? isBalanceSufficient(balanceA.balance, a.value, a.token.decimals || 0) : false
    const isSufficientB = balanceB ? isBalanceSufficient(balanceB.balance, b.value, b.token.decimals || 0) : false
    return isSufficientA === isSufficientB ? 0 : isSufficientA ? -1 : 1
  })

  return (
    <div className="mt-3 w-full">
      <Text variant="normal" color="primary" fontWeight="bold">
        Select a fee option
      </Text>
      <div className="flex flex-col mt-2 gap-2">
        {sortedOptions.map((option, index) => {
          const isSelected = selectedFeeOptionAddress === (option.token.contractAddress ?? ZeroAddress)
          const balance = feeOptionBalances.find(b => b.tokenName === option.token.name)
          const isSufficient = isBalanceSufficient(balance?.balance || '0', option.value, option.token.decimals || 0)
          return (
            <div
              className={cn(
                'px-3 py-2 rounded-xl border-2 border-solid bg-background-raised',
                isSelected ? 'border-border-focus' : 'border-transparent'
              )}
              key={index}
              onClick={() => {
                if (isSufficient) {
                  setSelectedFeeOptionAddress(option.token.contractAddress ?? ZeroAddress)
                  setFeeOptionAlert(undefined)
                } else {
                  setFeeOptionAlert({
                    title: `Insufficient ${option.token.name} balance`,
                    description: `Please select another fee option or add funds to your wallet.`,
                    variant: 'warning'
                  })
                }
              }}
            >
              <div className="flex flex-row justify-between items-center">
                <div className="flex flex-row items-center gap-2">
                  <TokenImage src={option.token.logoURL} symbol={option.token.name} />
                  <div className="flex flex-col">
                    <Text variant="small" color="primary" fontWeight="bold">
                      {option.token.name}
                    </Text>
                    <Text variant="xsmall" color="secondary">
                      Fee:{' '}
                      {parseFloat(formatUnits(BigInt(option.value), option.token.decimals || 0)).toLocaleString(undefined, {
                        maximumFractionDigits: 6
                      })}
                    </Text>
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <Text variant="xsmall" color="secondary">
                    Balance:
                  </Text>
                  <Text variant="xsmall" color="primary">
                    {parseFloat(formatUnits(BigInt(balance?.balance || '0'), option.token.decimals || 0)).toLocaleString(
                      undefined,
                      { maximumFractionDigits: 6 }
                    )}
                  </Text>
                </div>
              </div>
            </div>
          )
        })}
      </div>
      <div className="flex mt-3 items-end justify-center flex-col">
        {feeOptionAlert && (
          <div className="mt-3">
            <Alert
              title={feeOptionAlert.title}
              description={feeOptionAlert.description}
              secondaryDescription={feeOptionAlert.secondaryDescription}
              variant={feeOptionAlert.variant}
            />
          </div>
        )}
      </div>
    </div>
  )
}
