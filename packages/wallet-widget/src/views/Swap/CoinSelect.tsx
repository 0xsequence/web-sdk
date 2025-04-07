import { cn, cardVariants, Text, ChevronDownIcon, TokenImage, compareAddress } from '@0xsequence/design-system'
import { AnimatePresence } from 'motion/react'
import { useState } from 'react'
import { useChains } from 'wagmi'

import { CoinRow } from '../../components/SearchLists/TokenList/CoinRow'
import { SlideupDrawer } from '../../components/SlideupDrawer'
import { useSettings } from '../../hooks'
import { TokenBalanceWithPrice } from '../../utils'
import { formatTokenInfo } from '../../utils/formatBalance'

export const CoinSelect = ({
  selectType,
  coinList,
  selectedCoin,
  setSelectedCoin
}: {
  selectType: 'from' | 'to'
  coinList: TokenBalanceWithPrice[]
  selectedCoin: TokenBalanceWithPrice | undefined
  setSelectedCoin: (coin: TokenBalanceWithPrice, type: 'from' | 'to') => void
}) => {
  const { fiatCurrency } = useSettings()
  const chains = useChains()

  const [isSelectorOpen, setIsSelectorOpen] = useState(false)

  const { logo, name, symbol, displayBalance } = formatTokenInfo(selectedCoin, fiatCurrency.sign, chains)

  const handleSelect = (coin: TokenBalanceWithPrice) => {
    setSelectedCoin(coin, selectType)
    setIsSelectorOpen(false)
  }

  return (
    <div>
      <div
        className={cn(cardVariants({ clickable: true }), 'flex flex-row justify-between items-center')}
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
          <SlideupDrawer
            label="Select Coin"
            buttonLabel="Close"
            handleButtonPress={() => setIsSelectorOpen(false)}
            onClose={() => setIsSelectorOpen(false)}
          >
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
