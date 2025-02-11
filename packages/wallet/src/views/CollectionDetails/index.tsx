import { Image, Text, TokenImage } from '@0xsequence/design-system'
import { TokenBalance } from '@0xsequence/indexer'
import { formatDisplay, useCollectionBalanceDetails, ContractVerificationStatus } from '@0xsequence/kit'
import { ethers } from 'ethers'
import { useAccount } from 'wagmi'

import { useNavigation } from '../../hooks'
import { NetworkBadge } from '../../shared/NetworkBadge'

import { CollectionDetailsSkeleton } from './Skeleton'

interface CollectionDetailsProps {
  chainId: number
  contractAddress: string
}

export const CollectionDetails = ({ chainId, contractAddress }: CollectionDetailsProps) => {
  const { setNavigation } = useNavigation()
  const { address: accountAddress } = useAccount()
  const { data: collectionBalanceData, isPending: isPendingCollectionBalance } = useCollectionBalanceDetails({
    chainId,
    filter: {
      accountAddresses: accountAddress ? [accountAddress] : [],
      contractStatus: ContractVerificationStatus.ALL,
      contractWhitelist: [contractAddress],
      omitNativeBalances: true
    }
  })

  const contractInfo = collectionBalanceData?.[0]?.contractInfo
  const collectionLogoURI = contractInfo?.logoURI

  if (isPendingCollectionBalance) {
    return <CollectionDetailsSkeleton chainId={chainId} />
  }

  const onClickItem = (balance: TokenBalance) => {
    setNavigation &&
      setNavigation({
        location: 'collectible-details',
        params: {
          contractAddress: balance.contractAddress,
          chainId: balance.chainId,
          tokenId: balance.tokenID || ''
        }
      })
  }

  return (
    <div className="flex px-4 pb-5 pt-3 mt-8 flex-col items-center justify-center gap-10">
      <div className="flex flex-col gap-2 justify-center items-center">
        <TokenImage src={collectionLogoURI} size="lg" />
        <Text variant="large" fontWeight="bold" color="text100">
          {contractInfo?.name || 'Unknown'}
        </Text>
        <NetworkBadge chainId={chainId} />
        <Text variant="normal" fontWeight="medium" color="text50">{`${
          collectionBalanceData?.length || 0
        } Unique Collectibles`}</Text>
      </div>
      <div className="w-full">
        <Text variant="normal" fontWeight="medium" color="text50">
          {`Owned (${collectionBalanceData?.length || 0})`}
        </Text>
        <div
          className="w-full mt-3"
          style={{
            display: 'grid',
            gridTemplateColumns: `calc(50% - ${vars.space[1]}) calc(50% - ${vars.space[1]})`,
            gap: vars.space[2]
          }}
        >
          {collectionBalanceData?.map((balance, index) => {
            const unformattedBalance = balance.balance
            const decimals = balance?.tokenMetadata?.decimals || 0
            const formattedBalance = formatDisplay(ethers.formatUnits(unformattedBalance, decimals))

            return (
              <div className="select-none cursor-pointer" key={index} onClick={() => onClickItem(balance)}>
                <div className="flex bg-background-secondary aspect-square w-full rounded-xl justify-center items-center mb-2">
                  <Image className="rounded-lg" style={{ height: '100%' }} src={balance.tokenMetadata?.image} />
                </div>
                <div>
                  <Text variant="normal" fontWeight="bold" color="text100">
                    {`${balance.tokenMetadata?.name}`}
                  </Text>
                </div>
                <div>
                  <Text className="mt-1" variant="normal" fontWeight="medium" color="text50">
                    {formattedBalance} Owned
                  </Text>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
