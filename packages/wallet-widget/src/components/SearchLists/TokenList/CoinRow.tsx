import { formatAddress, getNetwork } from '@0xsequence/connect'
import { Text, TokenImage, GradientAvatar } from '@0xsequence/design-system'
import { getAddress } from 'viem'
import { useChains } from 'wagmi'

import { useSettings } from '../../../hooks'
import { formatTokenInfo } from '../../../utils/formatBalance'
import { TokenBalanceWithPrice } from '../../../utils/tokens'
import { ListCardNav } from '../../ListCard/ListCardNav'

interface BalanceItemProps {
  balance: TokenBalanceWithPrice
  includeUserAddress?: boolean
  onTokenClick: (token: TokenBalanceWithPrice) => void
}

export const CoinRow = ({ balance, onTokenClick, includeUserAddress = false }: BalanceItemProps) => {
  const { fiatCurrency } = useSettings()
  const chains = useChains()
  const { logo, name, symbol, displayBalance, fiatBalance } = formatTokenInfo(balance, fiatCurrency.sign, chains)
  const isTestnet = getNetwork(balance.chainId).testnet

  const userAddress = getAddress(balance.accountAddress)

  const onClick = () => {
    onTokenClick(balance)
  }

  return (
    <ListCardNav type="custom" onClick={onClick} style={{ height: '68px' }}>
      <div className="flex flex-row justify-between items-center w-full gap-2">
        <div className="relative">
          <TokenImage src={logo} symbol={symbol} withNetwork={balance.chainId} />
          {isTestnet && (
            <div
              className="absolute z-1 border rounded-full"
              style={{
                width: '6px',
                height: '6px',
                right: '-1.5px',
                bottom: '6.8px',
                backgroundColor: '#F4B03E'
              }}
            />
          )}
        </div>
        <div className="flex flex-row gap-2 items-center" style={{ flex: '1 1 0', width: 0 }}>
          <div className="flex flex-col w-full">
            <div className="flex flex-row w-full">
              <Text className="overflow-hidden" variant="normal" color="primary" ellipsis>
                {name}
              </Text>
            </div>
            {includeUserAddress && (
              <div className="flex flex-row gap-1 items-center">
                <GradientAvatar address={userAddress} size="xs" />
                <Text className="overflow-hidden" variant="small" color="muted" ellipsis>
                  {formatAddress(userAddress)}
                </Text>
              </div>
            )}
          </div>
        </div>
        <div className="flex flex-row justify-end items-center" style={{ flex: '1 1 0', width: 0 }}>
          <div className="flex flex-col items-end w-full">
            <div className="flex flex-row justify-end w-full">
              <Text className="overflow-hidden" variant="small" color="primary" ellipsis>
                {displayBalance}
              </Text>
            </div>
            <Text variant="small" color="muted">
              {fiatBalance}
            </Text>
          </div>
        </div>
      </div>
    </ListCardNav>
  )
}
