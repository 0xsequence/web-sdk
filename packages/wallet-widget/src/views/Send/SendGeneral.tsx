import { useWallets } from '@0xsequence/connect'
import { TabsHeader, TabsContent, TabsRoot } from '@0xsequence/design-system'
import { useState } from 'react'

import { CollectiblesList, TokenList } from '../../components/SearchLists'
import { useSettings, useNavigation, useGetAllTokensDetails } from '../../hooks'
import { TokenBalanceWithPrice } from '../../utils/tokens'

export const SendGeneral = () => {
  const { setNavigation } = useNavigation()
  const { wallets } = useWallets()
  const { allNetworks, hideUnlistedTokens } = useSettings()
  const [selectedTab, setSelectedTab] = useState<'coins' | 'collectibles'>('coins')

  const activeWallet = wallets.find(wallet => wallet.isActive)

  const { data: tokenBalancesData = [], isLoading: isLoadingTokenBalances } = useGetAllTokensDetails({
    accountAddresses: [activeWallet?.address || ''],
    chainIds: allNetworks,
    contractWhitelist: [],
    hideUnlistedTokens
  })

  const handleTokenClick = (token: TokenBalanceWithPrice) => {
    setNavigation({
      location: 'send-coin',
      params: {
        chainId: token.chainId,
        contractAddress: token.contractAddress
      }
    })
  }

  const handleCollectibleClick = (token: TokenBalanceWithPrice) => {
    setNavigation({
      location: 'send-collectible',
      params: {
        chainId: token.chainId,
        contractAddress: token.contractAddress,
        tokenId: token.tokenID || ''
      }
    })
  }

  return (
    <div className="px-4 pb-2">
      <TabsRoot
        className="flex flex-col justify-center items-center gap-4"
        value={selectedTab}
        onValueChange={value => setSelectedTab(value as 'coins' | 'collectibles')}
      >
        <TabsHeader
          tabs={[
            { label: 'Coins', value: 'coins' },
            { label: 'Collectibles', value: 'collectibles' }
          ]}
          value={selectedTab}
        />
        <TabsContent className="w-full" value={'coins'}>
          <TokenList
            tokenBalancesData={tokenBalancesData}
            isLoadingFirstPage={isLoadingTokenBalances}
            onTokenClick={handleTokenClick}
            enableFilters={false}
          />
        </TabsContent>
        <TabsContent className="flex flex-col w-full gap-4" value={'collectibles'}>
          <CollectiblesList
            tokenBalancesData={tokenBalancesData}
            isLoadingFirstPage={isLoadingTokenBalances}
            onTokenClick={handleCollectibleClick}
            enableFilters={false}
            gridColumns={3}
          />
        </TabsContent>
      </TabsRoot>
    </div>
  )
}
