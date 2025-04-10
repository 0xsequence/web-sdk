import { TokenImage, Text } from '@0xsequence/design-system'
import { useGetTokenBalancesSummary } from '@0xsequence/hooks'
import { ContractType } from '@0xsequence/indexer'

import { useSettings } from '../../hooks'
import { MediaIconWrapper } from '../IconWrappers'
import { ListCardSelect } from '../ListCard/ListCardSelect'

export const CollectionsFilter = () => {
  const { selectedCollectionsObservable, selectedNetworks, selectedWallets, setSelectedCollections } = useSettings()
  const selectedCollections = selectedCollectionsObservable.get()

  const { data: tokens } = useGetTokenBalancesSummary({
    chainIds: selectedNetworks,
    filter: {
      accountAddresses: selectedWallets.map(wallet => wallet.address),
      omitNativeBalances: true
    }
  })

  const collections = tokens
    ?.filter(token => token.contractType === ContractType.ERC721 || token.contractType === ContractType.ERC1155)
    .map(collection => {
      return {
        contractAddress: collection.contractAddress,
        chainId: collection.chainId,
        contractInfo: {
          name: collection.contractInfo?.name || '',
          logoURI: collection.contractInfo?.logoURI || ''
        }
      }
    })

  return (
    <div className="flex flex-col bg-background-primary gap-3">
      {collections?.length && collections.length > 1 && (
        <ListCardSelect
          key="all"
          isSelected={selectedCollectionsObservable.get().length === 0}
          onClick={() => setSelectedCollections([])}
        >
          <MediaIconWrapper
            iconList={collections.map(collection => (
              <div className="bg-background-backdrop">
                <TokenImage src={collection.contractInfo?.logoURI} symbol={collection.contractInfo?.name} />
              </div>
            ))}
            size="sm"
          />
          <Text color="primary" fontWeight="medium" variant="normal">
            All
          </Text>
        </ListCardSelect>
      )}
      {collections?.map(collection => (
        <ListCardSelect
          key={collection.contractAddress}
          isSelected={
            selectedCollections.some(c => c.contractAddress === collection.contractAddress && c.chainId === collection.chainId) ||
            collections.length === 1
          }
          onClick={collections.length > 1 ? () => setSelectedCollections([collection]) : undefined}
        >
          <TokenImage
            src={collection.contractInfo?.logoURI}
            symbol={collection.contractInfo?.name}
            withNetwork={collection.chainId}
          />
          <Text color="primary" fontWeight="medium" variant="normal">
            {collection.contractInfo?.name}
          </Text>
        </ListCardSelect>
      ))}
    </div>
  )
}
