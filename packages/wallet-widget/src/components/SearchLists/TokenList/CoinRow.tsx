import { compareAddress, formatDisplay, getNativeTokenInfoByChainId } from '@0xsequence/connect'
import { Text, TokenImage } from '@0xsequence/design-system'
import { useMemo } from 'react'
import { formatUnits, zeroAddress } from 'viem'
import { useConfig } from 'wagmi'

import { useSettings } from '../../../hooks'
import { TokenBalanceWithPrice } from '../../../utils/tokens'
import { ListCardNav } from '../../ListCard/ListCardNav'

interface BalanceItemProps {
  balance: TokenBalanceWithPrice
  onTokenClick: (token: TokenBalanceWithPrice) => void
}

export const CoinRow = ({ balance, onTokenClick }: BalanceItemProps) => {
  const { fiatCurrency } = useSettings()
  const { chains } = useConfig()
  const isNativeToken = compareAddress(balance.contractAddress, zeroAddress)
  const nativeTokenInfo = getNativeTokenInfoByChainId(balance.chainId, chains)
  const logoURI = isNativeToken ? nativeTokenInfo.logoURI : balance?.contractInfo?.logoURI
  const tokenName = isNativeToken ? nativeTokenInfo.name : balance?.contractInfo?.name || 'Unknown'
  const symbol = isNativeToken ? nativeTokenInfo.symbol : balance?.contractInfo?.symbol

  const quantity = useMemo(() => {
    const decimals = isNativeToken ? nativeTokenInfo.decimals : balance?.contractInfo?.decimals
    const bal = formatUnits(BigInt(balance.balance), decimals || 0)
    const displayBalance = formatDisplay(bal)
    const symbol = isNativeToken ? nativeTokenInfo.symbol : balance?.contractInfo?.symbol

    return `${displayBalance} ${symbol}`
  }, [balance])

  const value = useMemo(() => {
    const decimals = isNativeToken ? nativeTokenInfo.decimals : balance?.contractInfo?.decimals
    const bal = formatUnits(BigInt(balance.balance), decimals || 0)
    return `${fiatCurrency.sign}${(balance.price.value * Number(bal)).toFixed(2)}`
  }, [balance, fiatCurrency])

  const onClick = () => {
    onTokenClick(balance)
  }

  return (
    <ListCardNav type="custom" onClick={onClick} style={{ height: '60px' }}>
      <div className="flex flex-row justify-between w-full gap-2">
        <TokenImage src={logoURI} symbol={symbol} size="md" withNetwork={balance.chainId} />
        <div className="flex flex-row gap-2 items-center" style={{ flex: '1 1 0', width: 0 }}>
          <Text className="overflow-hidden" variant="normal" color="primary" fontWeight="bold" ellipsis>
            {tokenName}
          </Text>
        </div>
        <div className="flex flex-row justify-end items-center" style={{ flex: '1 1 0', width: 0 }}>
          <div className="flex flex-col items-end w-full">
            <div className="flex flex-row justify-end w-full">
              <Text className="overflow-hidden" variant="normal" color="primary" fontWeight="bold" ellipsis>
                {quantity}
              </Text>
            </div>
            <Text variant="normal" color="muted" fontWeight="bold">
              {value}
            </Text>
          </div>
        </div>
      </div>
    </ListCardNav>
  )
}
