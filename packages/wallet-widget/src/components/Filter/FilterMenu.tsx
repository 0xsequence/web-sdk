import { useWallets } from '@0xsequence/connect'

import { FilterOptions } from './FilterOptions.js'

export const FilterMenu = ({ filterMenuType }: { filterMenuType: 'tokens' | 'collectibles' | 'history' }) => {
  const { wallets } = useWallets()

  return (
    <div className="flex flex-row gap-2 w-full overflow-x-auto hide-scrollbar" style={{ scrollbarWidth: 'none' }}>
      {filterMenuType === 'collectibles' && <FilterOptions filterType="collections" />}
      <FilterOptions filterType="networks" />
      {wallets.length > 1 && <FilterOptions filterType="wallets" />}
    </div>
  )
}
