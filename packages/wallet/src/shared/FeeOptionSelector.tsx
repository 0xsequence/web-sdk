import { Box, Text, TokenImage } from '@0xsequence/design-system'
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
    <Box marginTop="3" width="full">
      <Text variant="normal" color="text100" fontWeight="bold">
        Select a fee option
      </Text>
      <Box flexDirection="column" marginTop="2" gap="2">
        {sortedOptions.map((option, index) => {
          const isSelected = selectedFeeOptionAddress === (option.token.contractAddress ?? ZeroAddress)
          const balance = feeOptionBalances.find(b => b.tokenName === option.token.name)
          const isSufficient = isBalanceSufficient(balance?.balance || '0', option.value, option.token.decimals || 0)
          return (
            <Box
              key={index}
              paddingX="3"
              paddingY="2"
              borderRadius="md"
              borderColor={isSelected ? 'borderFocus' : 'transparent'}
              borderWidth="thick"
              borderStyle="solid"
              background="backgroundRaised"
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
              cursor={isSufficient ? 'pointer' : 'default'}
              opacity={isSufficient ? '100' : '50'}
            >
              <Box flexDirection="row" justifyContent="space-between" alignItems="center">
                <Box flexDirection="row" alignItems="center" gap="2">
                  <TokenImage src={option.token.logoURL} symbol={option.token.name} />
                  <Box flexDirection="column">
                    <Text variant="small" color="text100" fontWeight="bold">
                      {option.token.name}
                    </Text>
                    <Text variant="xsmall" color="text80">
                      Fee:{' '}
                      {parseFloat(formatUnits(BigInt(option.value), option.token.decimals || 0)).toLocaleString(undefined, {
                        maximumFractionDigits: 6
                      })}
                    </Text>
                  </Box>
                </Box>
                <Box flexDirection="column" alignItems="flex-end">
                  <Text variant="xsmall" color="text80">
                    Balance:
                  </Text>
                  <Text variant="xsmall" color="text100">
                    {parseFloat(formatUnits(BigInt(balance?.balance || '0'), option.token.decimals || 0)).toLocaleString(
                      undefined,
                      { maximumFractionDigits: 6 }
                    )}
                  </Text>
                </Box>
              </Box>
            </Box>
          )
        })}
      </Box>
      <Box marginTop="3" alignItems="flex-end" justifyContent="center" flexDirection="column">
        {feeOptionAlert && (
          <Box marginTop="3">
            <Alert
              title={feeOptionAlert.title}
              description={feeOptionAlert.description}
              secondaryDescription={feeOptionAlert.secondaryDescription}
              variant={feeOptionAlert.variant}
            />
          </Box>
        )}
      </Box>
    </Box>
  )
}
