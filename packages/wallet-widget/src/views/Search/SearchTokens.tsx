import { useGetTokenBalancesSummary } from '@0xsequence/hooks'
import { ContractVerificationStatus } from '@0xsequence/indexer'
import { useObservable } from 'micro-observables'

import { TokenList } from '../../components/SearchLists'
import { useNavigation, useSettings } from '../../hooks'
import { TokenBalanceWithPrice } from '../../utils'

export const SearchTokens = () => {
  const { setNavigation } = useNavigation()
  const { selectedWalletsObservable, selectedNetworksObservable, hideUnlistedTokens } = useSettings()

  const selectedWallets = useObservable(selectedWalletsObservable)
  const selectedNetworks = useObservable(selectedNetworksObservable)

  const { data: tokenBalancesData = [], isPending: isPendingTokenBalances } = useGetTokenBalancesSummary({
    chainIds: selectedNetworks,
    filter: {
      accountAddresses: selectedWallets.map(wallet => wallet.address),
      contractStatus: hideUnlistedTokens ? ContractVerificationStatus.VERIFIED : ContractVerificationStatus.ALL,
      omitNativeBalances: false
    }
  })

  const handleTokenClick = (balance: TokenBalanceWithPrice) => {
    setNavigation({
      location: 'coin-details',
      params: {
        contractAddress: balance.contractAddress,
        chainId: balance.chainId,
        accountAddress: balance.accountAddress
      }
    })
  }

  return (
    <div className="p-4 pt-2 w-full">
      <TokenList
        tokenBalancesData={tokenBalancesData}
        isPendingTokenBalances={isPendingTokenBalances}
        onTokenClick={handleTokenClick}
        includeUserAddress
      />
    </div>
  )
}
