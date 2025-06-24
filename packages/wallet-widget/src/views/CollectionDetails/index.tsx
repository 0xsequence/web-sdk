import { ContractVerificationStatus, useWallets } from '@0xsequence/connect'
import { Divider, TabsContent, TabsPrimitive, Text } from '@0xsequence/design-system'
import { useGetTokenBalancesByContract } from '@0xsequence/hooks'
import type { TokenBalance } from '@0xsequence/indexer'
import { useState } from 'react'

import type { TokenInfo } from '../../components/NavigationHeader/index.js'
import { NoResults } from '../../components/NoResults.js'
import { CollectiblesTab } from '../../components/SearchLists/CollectiblesList/CollectiblesTab.js'
import { useNavigation, useSettings } from '../../hooks/index.js'

export const CollectionDetails = ({ contractAddress, chainId }: TokenInfo) => {
  const { setNavigation } = useNavigation()
  const { wallets } = useWallets()
  const { hideUnlistedTokens } = useSettings()

  const [selectedTab, setSelectedTab] = useState<'collectibles' | 'explore'>('collectibles')

  const {
    data: collectibles,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage
  } = useGetTokenBalancesByContract({
    chainIds: [chainId],
    filter: {
      accountAddresses: wallets.map(wallet => wallet.address),
      contractAddresses: [contractAddress],
      contractStatus: hideUnlistedTokens ? ContractVerificationStatus.VERIFIED : ContractVerificationStatus.ALL
    }
  })

  const onClickCollectible = (collectible: TokenBalance) => {
    setNavigation({
      location: 'collectible-details',
      params: {
        contractAddress: collectible.contractAddress,
        chainId: collectible.chainId,
        tokenId: collectible.tokenID || '',
        accountAddress: collectible.accountAddress
      }
    })
  }

  return (
    <div>
      <TabsPrimitive.Root
        className="w-full"
        value={selectedTab}
        onValueChange={value => setSelectedTab(value as 'collectibles' | 'explore')}
      >
        <div className="flex flex-col w-full relative">
          <TabsPrimitive.TabsList className="px-4">
            <TabsPrimitive.TabsTrigger className="h-10 relative cursor-pointer" value="collectibles">
              <Text className="px-4" variant="medium" color={selectedTab === 'collectibles' ? 'primary' : 'muted'}>
                My Collectibles
              </Text>
              {selectedTab === 'collectibles' && <div className="absolute bottom-0 w-full h-[2px] bg-white" />}
            </TabsPrimitive.TabsTrigger>
            <TabsPrimitive.TabsTrigger className="h-10 relative cursor-pointer" value="explore">
              <Text className="px-4" variant="medium" color={selectedTab === 'explore' ? 'primary' : 'muted'}>
                Explore
              </Text>
              {selectedTab === 'explore' && <div className="absolute bottom-0 w-full h-[2px] bg-white" />}
            </TabsPrimitive.TabsTrigger>
          </TabsPrimitive.TabsList>
          <Divider className="absolute bottom-0 my-0 w-full" />
        </div>

        <div className="flex flex-col p-4 pb-2 gap-4">
          <TabsContent value="collectibles">
            <CollectiblesTab
              displayedCollectibleBalances={collectibles?.pages.flatMap(page => page.balances) || []}
              fetchMoreCollectibleBalances={fetchNextPage}
              hasMoreCollectibleBalances={hasNextPage}
              isFetchingMoreCollectibleBalances={isFetchingNextPage}
              isFetchingInitialBalances={isLoading}
              onTokenClick={onClickCollectible}
            />
          </TabsContent>
          <TabsContent value="explore">
            <NoResults customText="Coming soon" />
          </TabsContent>
        </div>
      </TabsPrimitive.Root>
    </div>
  )
}
