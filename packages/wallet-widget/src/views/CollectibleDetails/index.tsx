import { formatDisplay, truncateAtIndex } from '@0xsequence/connect'
import { findSupportedNetwork } from '@0xsequence/connect'
import {
  ArrowUpIcon,
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  ExternalLinkIcon,
  GradientAvatar,
  Image,
  NetworkImage,
  Separator,
  Skeleton,
  Text
} from '@0xsequence/design-system'
import { useGetSingleTokenBalance } from '@0xsequence/hooks'
import { useState } from 'react'
import { formatUnits, getAddress } from 'viem'
import { useConfig } from 'wagmi'

import type { TokenInfo } from '../../components/NavigationHeader/index.js'
import { TokenTileImage } from '../../components/TokenTileImage.js'
import { useNavigation, useSettings } from '../../hooks/index.js'

import { InfoBadge } from './InfoBadge.js'
import { PropertiesBadge } from './PropertiesBadge.js'
import { CollectibleDetailsSkeleton } from './Skeleton.js'

export const CollectibleDetails = ({ contractAddress, chainId, tokenId, accountAddress }: TokenInfo) => {
  const { chains } = useConfig()
  const { setNavigation } = useNavigation()
  const network = findSupportedNetwork(chainId)
  const { hideUnlistedTokens } = useSettings()

  const [foundMarketplaceURL] = useState<string | null>(null)

  const isReadOnly = !chains.map(chain => chain.id).includes(chainId)

  const { data: tokenBalance, isLoading: isLoadingCollectibleBalance } = useGetSingleTokenBalance({
    chainId,
    contractAddress,
    accountAddress: accountAddress || '',
    tokenId,
    hideUnlistedTokens: hideUnlistedTokens
  })

  const isLoading = isLoadingCollectibleBalance

  if (isLoading) {
    return <CollectibleDetailsSkeleton isReadOnly={isReadOnly} />
  }

  const onClickSend = () => {
    setNavigation({
      location: 'send-collectible',
      params: {
        chainId,
        contractAddress,
        tokenId: tokenId || ''
      }
    })
  }

  const onClickOpenScan = () => {
    // window.open(`${network?.blockExplorer?.rootUrl}token/${contractAddress}?a=${tokenId}`, '_blank')
    window.open(`${network?.blockExplorer?.rootUrl}nft/${contractAddress}/${tokenId}`, '_blank')
  }

  const onClickOpenMarketplace = () => {}

  const collectionLogo = tokenBalance?.contractInfo?.logoURI
  const collectionName = tokenBalance?.contractInfo?.name || 'Unknown Collection'

  const decimals = tokenBalance?.tokenMetadata?.decimals || 0
  const rawBalance = tokenBalance?.balance || '0'
  const balance = formatUnits(BigInt(rawBalance), decimals)
  const formattedBalance = formatDisplay(Number(balance))

  const onClickCollection = () => {
    setNavigation({
      location: 'collection-details',
      params: {
        chainId,
        contractAddress
      }
    })
  }

  return (
    <div>
      <div className="flex flex-col p-4 gap-4">
        <TokenTileImage src={tokenBalance?.tokenMetadata?.image} symbol={tokenBalance?.tokenMetadata?.name} />
        <div className="flex flex-row gap-4">
          <Button className="text-primary w-full" variant="secondary" onClick={onClickSend}>
            <ArrowUpIcon />
            Send
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="text-primary w-full" variant="secondary">
                <ExternalLinkIcon />
                Open in...
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-full min-w-[200px]">
              <DropdownMenuItem onClick={onClickOpenScan}>
                <Text variant="normal" fontWeight="bold" color="primary">
                  Open in {network?.blockExplorer?.name}
                </Text>
              </DropdownMenuItem>
              {foundMarketplaceURL && (
                <DropdownMenuItem onClick={onClickOpenMarketplace}>
                  <Text variant="normal" fontWeight="bold" color="primary">
                    Open in Marketplace
                  </Text>
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <Text variant="xxlarge" color="primary" fontWeight="bold">
          {tokenBalance?.tokenMetadata?.name || 'Unknown Collectible'}
        </Text>
        <div className="flex flex-row justify-between items-center">
          <Text variant="normal" color="primary">
            Network
          </Text>
          <InfoBadge
            leftIcon={<NetworkImage chainId={chainId} size="xs" />}
            label={chains.find(chain => chain.id === chainId)?.name || 'Unknown Network'}
          />
        </div>
        <Separator className="my-0" />
        <div className="flex flex-row justify-between items-center">
          <Text variant="normal" color="primary">
            Collection
          </Text>
          <InfoBadge
            leftIcon={
              collectionLogo ? (
                <Image src={collectionLogo} alt="collection logo" className="rounded-sm w-4" />
              ) : (
                <Skeleton className="w-4 h-4 rounded-sm" />
              )
            }
            label={collectionName}
            onClick={() => {
              onClickCollection()
            }}
          />
        </div>
        <Separator className="my-0" />
        <div className="flex flex-row justify-between items-center">
          <Text variant="normal" color="primary">
            Owner
          </Text>
          <InfoBadge
            leftIcon={
              tokenBalance?.accountAddress && <GradientAvatar address={getAddress(tokenBalance?.accountAddress)} size="xs" />
            }
            label={truncateAtIndex(tokenBalance?.accountAddress || '', 8) || 'Unknown Owner'}
          />
        </div>
        <Separator className="my-0" />
        <div className="flex flex-row justify-between items-center">
          <Text variant="normal" color="primary">
            Balance
          </Text>
          <Text variant="normal" color="primary">
            {formattedBalance}
          </Text>
        </div>
        <Separator className="my-0" />
        <Text variant="normal" color="primary">
          {tokenBalance?.tokenMetadata?.description}
        </Text>
        {tokenBalance?.tokenMetadata?.properties?.length > 0 && (
          <>
            <Separator className="my-0" />
            <Text variant="normal" color="primary">
              Properties
            </Text>
            {tokenBalance?.tokenMetadata?.properties?.map((property: any) => (
              <PropertiesBadge name={property.name} value={property.value} />
            ))}
          </>
        )}
      </div>
    </div>
  )
}
