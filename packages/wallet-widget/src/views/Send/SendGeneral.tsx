import { useWallets } from '@0xsequence/connect'
import { TabsHeader, TabsContent, TabsRoot } from '@0xsequence/design-system'
import { useGetTokenBalancesDetails, useGetTokenBalancesSummary } from '@0xsequence/hooks'
import { ContractVerificationStatus } from '@0xsequence/indexer'
import { useState } from 'react'

import { CollectiblesList, TokenList } from '../../components/SearchLists'
import { useSettings, useNavigation } from '../../hooks'
import { TokenBalanceWithPrice } from '../../utils/tokens'

export const SendGeneral = () => {
  const { setNavigation } = useNavigation()
  const { wallets } = useWallets()
  const { allNetworks, hideUnlistedTokens } = useSettings()
  const [selectedTab, setSelectedTab] = useState<'coins' | 'collectibles'>('coins')

  const activeWallet = wallets.find(wallet => wallet.isActive)

  const { data: tokenBalancesData = [], isPending: isPendingTokenBalances } = useGetTokenBalancesSummary({
    chainIds: allNetworks,
    filter: {
      accountAddresses: [activeWallet?.address || ''],
      contractStatus: hideUnlistedTokens ? ContractVerificationStatus.VERIFIED : ContractVerificationStatus.ALL,
      omitNativeBalances: false
    }
  })

  const { data: collectibleBalancesData = [], isPending: isPendingCollectibleBalances } = useGetTokenBalancesDetails({
    chainIds: allNetworks,
    filter: {
      accountAddresses: [activeWallet?.address || ''],
      contractStatus: hideUnlistedTokens ? ContractVerificationStatus.VERIFIED : ContractVerificationStatus.ALL,
      omitNativeBalances: false
    }
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
            isPendingTokenBalances={isPendingTokenBalances}
            onTokenClick={handleTokenClick}
            enableFilters={false}
          />
        </TabsContent>
        <TabsContent className="flex flex-col w-full gap-4" value={'collectibles'}>
          <CollectiblesList
            tokenBalancesData={collectibleBalancesData}
            isPendingTokenBalances={isPendingCollectibleBalances}
            onTokenClick={handleCollectibleClick}
            enableFilters={false}
            gridColumns={3}
          />
        </TabsContent>
      </TabsRoot>
    </div>
  )
}
