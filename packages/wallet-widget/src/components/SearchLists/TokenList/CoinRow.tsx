import { Text, TokenImage } from '@0xsequence/design-system'
import { useChains } from 'wagmi'

import { useSettings } from '../../../hooks'
import { formatTokenInfo } from '../../../utils/formatBalance'
import { TokenBalanceWithPrice } from '../../../utils/tokens'
import { ListCardNav } from '../../ListCard/ListCardNav'

interface BalanceItemProps {
  balance: TokenBalanceWithPrice
  onTokenClick: (token: TokenBalanceWithPrice) => void
}

export const CoinRow = ({ balance, onTokenClick }: BalanceItemProps) => {
  const { fiatCurrency } = useSettings()
  const chains = useChains()
  const { logo, name, symbol, displayBalance, fiatBalance } = formatTokenInfo(balance, fiatCurrency.sign, chains)

  const onClick = () => {
    onTokenClick(balance)
  }

  return (
    <ListCardNav type="custom" onClick={onClick} style={{ height: '60px' }}>
      <div className="flex flex-row justify-between w-full gap-2">
        <TokenImage src={logo} symbol={symbol} withNetwork={balance.chainId} />
        <div className="flex flex-row gap-2 items-center" style={{ flex: '1 1 0', width: 0 }}>
          <Text className="overflow-hidden" variant="normal" color="primary" fontWeight="bold" ellipsis>
            {name}
          </Text>
        </div>
        <div className="flex flex-row justify-end items-center" style={{ flex: '1 1 0', width: 0 }}>
          <div className="flex flex-col items-end w-full">
            <div className="flex flex-row justify-end w-full">
              <Text className="overflow-hidden" variant="normal" color="primary" fontWeight="bold" ellipsis>
                {displayBalance}
              </Text>
            </div>
            <Text variant="normal" color="muted" fontWeight="bold">
              {fiatBalance}
            </Text>
          </div>
        </div>
      </div>
    </ListCardNav>
  )
}
