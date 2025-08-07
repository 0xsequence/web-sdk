import { formatDisplay, truncateAtIndex } from '@0xsequence/connect'
import {
  ArrowUpIcon,
  Button,
  Divider,
  ExternalLinkIcon,
  GradientAvatar,
  Image,
  NetworkImage,
  Skeleton,
  Text
} from '@0xsequence/design-system'
import { useGetSingleTokenBalance } from '@0xsequence/hooks'
import { findSupportedNetwork } from '@0xsequence/network'
import * as PopoverPrimitive from '@radix-ui/react-popover'
import { useEffect, useRef, useState } from 'react'
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

  const triggerRef = useRef<HTMLButtonElement>(null)
  const [triggerWidth, setTriggerWidth] = useState<number>(0)

  const [isExternalPopoverOpen, setIsExternalPopoverOpen] = useState(false)
  const [foundMarketplaceURL] = useState<string | null>(null)

  useEffect(() => {
    if (triggerRef.current) {
      setTriggerWidth(triggerRef.current.offsetWidth)
    }
  }, [isExternalPopoverOpen])

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
          <Button
            className="text-primary w-full bg-background-secondary"
            variant="glass"
            leftIcon={ArrowUpIcon}
            label="Send"
            onClick={onClickSend}
          />

          <PopoverPrimitive.Root open={isExternalPopoverOpen} onOpenChange={setIsExternalPopoverOpen}>
            <PopoverPrimitive.Trigger asChild>
              <Button
                ref={triggerRef}
                className="text-primary w-full bg-background-secondary"
                variant="glass"
                leftIcon={ExternalLinkIcon}
                label="Open in..."
              />
            </PopoverPrimitive.Trigger>

            {isExternalPopoverOpen && (
              <PopoverPrimitive.Content
                className="flex flex-col p-2 gap-2 z-20 rounded-2xl border border-border-normal"
                style={{ background: 'rgb(25, 25, 25)', minWidth: triggerWidth }}
                asChild
                side="bottom"
                sideOffset={-44}
                align="end"
              >
                <div>
                  <div
                    className="flex flex-row items-center py-2 px-4 gap-2 bg-background-secondary rounded-lg hover:opacity-80 cursor-pointer"
                    onClick={() => {
                      onClickOpenScan()
                    }}
                  >
                    <Text variant="normal" fontWeight="bold" color="primary">
                      Open in {network?.blockExplorer?.name}
                    </Text>
                  </div>
                  {foundMarketplaceURL && (
                    <div
                      className="flex flex-row items-center py-2 px-4 gap-2 bg-background-secondary rounded-lg hover:opacity-80 cursor-pointer"
                      onClick={() => {
                        onClickOpenMarketplace()
                      }}
                    >
                      <Text variant="normal" fontWeight="bold" color="primary">
                        Open in Marketplace
                      </Text>
                    </div>
                  )}
                </div>
              </PopoverPrimitive.Content>
            )}
          </PopoverPrimitive.Root>
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
        <Divider className="my-0" />
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
        <Divider className="my-0" />
        <div className="flex flex-row justify-between items-center">
          <Text variant="normal" color="primary">
            Owner
          </Text>
          <InfoBadge
            leftIcon={
              tokenBalance?.accountAddress && <GradientAvatar address={getAddress(tokenBalance?.accountAddress)} size="xs" />
            }
            label={truncateAtIndex(tokenBalance?.accountAddress || '', 6) || 'Unknown Owner'}
          />
        </div>
        <Divider className="my-0" />
        <div className="flex flex-row justify-between items-center">
          <Text variant="normal" color="primary">
            Balance
          </Text>
          <Text variant="normal" color="primary">
            {formattedBalance}
          </Text>
        </div>
        <Divider className="my-0" />
        <Text variant="normal" color="primary">
          {tokenBalance?.tokenMetadata?.description}
        </Text>
        {tokenBalance?.tokenMetadata?.properties?.length > 0 && (
          <>
            <Divider className="my-0" />
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
