import { cn, cardVariants, Text, ChevronDownIcon, TokenImage } from '@0xsequence/design-system'
import { AnimatePresence } from 'motion/react'
import { useState } from 'react'
import { useChains } from 'wagmi'

import { CoinRow } from '../../components/SearchLists/TokenList/CoinRow'
import { SlideupDrawer } from '../../components/Select/SlideupDrawer'
import { useSettings } from '../../hooks'
import { useSwap } from '../../hooks/useSwap'
import { TokenBalanceWithPrice } from '../../utils'
import { formatTokenInfo } from '../../utils/formatBalance'

export const CoinSelect = ({
  selectType,
  coinList,
  disabled
}: {
  selectType: 'from' | 'to'
  coinList: TokenBalanceWithPrice[]
  disabled?: boolean
}) => {
  const { fromCoin, toCoin, setFromCoin, setToCoin } = useSwap()
  const { fiatCurrency } = useSettings()
  const chains = useChains()

  const selectedCoin = selectType === 'from' ? fromCoin : toCoin
  const setSelectedCoin = selectType === 'from' ? setFromCoin : setToCoin

  const [isSelectorOpen, setIsSelectorOpen] = useState(false)

  const { logo, name, symbol, displayBalance } = formatTokenInfo(selectedCoin, fiatCurrency.sign, chains)

  const handleSelect = (coin: TokenBalanceWithPrice) => {
    setSelectedCoin(coin)
    setIsSelectorOpen(false)
  }

  return (
    <div>
      <div
        className={cn(cardVariants({ clickable: true, disabled }), 'flex flex-row justify-between items-center')}
        onClick={() => setIsSelectorOpen(true)}
      >
        <div className="flex flex-col gap-2 w-full">
          <Text variant="small" fontWeight="bold" color="muted">
            {selectType === 'from' ? 'From' : 'To'}
          </Text>
          {selectedCoin ? (
            <div className="flex flex-row gap-2 items-center">
              <TokenImage src={logo} symbol={symbol} />
              <div className="flex flex-col">
                <Text className="overflow-hidden" variant="small" color="primary" fontWeight="bold" ellipsis>
                  {name}
                </Text>
                <Text variant="small" color="muted">
                  {displayBalance}
                </Text>
              </div>
            </div>
          ) : (
            <Text variant="small" color="muted">
              Select Coin
            </Text>
          )}
        </div>
        <ChevronDownIcon className="text-muted" />
      </div>

      <AnimatePresence>
        {isSelectorOpen && (
          <SlideupDrawer label="Select Coin" onClose={() => setIsSelectorOpen(false)}>
            <div className="flex flex-col gap-2">
              {coinList.map((coin, index) => (
                <CoinRow key={index} balance={coin} onTokenClick={handleSelect} />
              ))}
            </div>
          </SlideupDrawer>
        )}
      </AnimatePresence>
    </div>
  )
}
