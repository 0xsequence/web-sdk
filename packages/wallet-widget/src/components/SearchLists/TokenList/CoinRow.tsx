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

  const getQuantity = () => {
    const decimals = isNativeToken ? nativeTokenInfo.decimals : balance?.contractInfo?.decimals
    const bal = formatUnits(BigInt(balance.balance), decimals || 0)
    const displayBalance = formatDisplay(bal)
    const symbol = isNativeToken ? nativeTokenInfo.symbol : balance?.contractInfo?.symbol

    return `${displayBalance} ${symbol}`
  }

  const getValue = () => {
    const decimals = isNativeToken ? nativeTokenInfo.decimals : balance?.contractInfo?.decimals
    const bal = formatUnits(BigInt(balance.balance), decimals || 0)
    return `${fiatCurrency.sign}${(balance.price.value * Number(bal)).toFixed(2)}`
  }

  const onClick = () => {
    onTokenClick(balance)
  }

  const balanceAndValue = useMemo(() => {
    return (
      <div className="flex flex-col items-end">
        <Text variant="normal" color="primary" fontWeight="bold" ellipsis>
          {getQuantity()}
        </Text>
        <Text variant="normal" color="muted" fontWeight="bold" ellipsis>
          {getValue()}
        </Text>
      </div>
    )
  }, [balance])

  return (
    <ListCardNav rightChildren={balanceAndValue} type="custom" onClick={onClick} style={{ height: '60px' }}>
      <TokenImage src={logoURI} symbol={symbol} size="md" withNetwork={balance.chainId} style={{ zIndex: '0' }} />
      <Text className="overflow-hidden whitespace-nowrap" variant="normal" color="primary" fontWeight="bold" ellipsis>
        {tokenName}
      </Text>
    </ListCardNav>
  )
}
