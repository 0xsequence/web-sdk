import { formatDisplay, truncateAtIndex, useWallets } from '@0xsequence/connect'
import {
  ArrowUpIcon,
  Button,
  Divider,
  ExternalLinkIcon,
  GradientAvatar,
  Image,
  NetworkImage,
  Text
} from '@0xsequence/design-system'
import { useGetSingleTokenBalance } from '@0xsequence/hooks'
import { useEffect } from 'react'
import { formatUnits, getAddress } from 'viem'
import { useConfig } from 'wagmi'

import type { TokenInfo } from '../../components/NavigationHeader/index.js'
import { TokenTileImage } from '../../components/TokenTileImage.js'
import { useNavigation } from '../../hooks/index.js'

import { InfoBadge } from './InfoBadge.js'
import { PropertiesBadge } from './PropertiesBadge.js'
import { CollectibleDetailsSkeleton } from './Skeleton.js'

export const CollectibleDetails = ({ contractAddress, chainId, tokenId, accountAddress }: TokenInfo) => {
  const { chains } = useConfig()
  const { setActiveWallet } = useWallets()
  const { setNavigation } = useNavigation()

  useEffect(() => {
    setActiveWallet(accountAddress || '')
  }, [accountAddress])

  const isReadOnly = !chains.map(chain => chain.id).includes(chainId)

  const { data: tokenBalance, isLoading: isLoadingCollectibleBalance } = useGetSingleTokenBalance({
    chainId,
    contractAddress,
    accountAddress: accountAddress || '',
    tokenId
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

  const collectionLogo = tokenBalance?.contractInfo?.logoURI
  const collectionName = tokenBalance?.contractInfo?.name || 'Unknown Collection'

  const decimals = tokenBalance?.tokenMetadata?.decimals || 0
  const rawBalance = tokenBalance?.balance || '0'
  const balance = formatUnits(BigInt(rawBalance), decimals)
  const formattedBalance = formatDisplay(Number(balance))

  return (
    <div>
      <div className="flex flex-col p-4 gap-4">
        <TokenTileImage src={tokenBalance?.tokenMetadata?.image} symbol={tokenBalance?.tokenMetadata?.name} />
        <div className="flex flex-row gap-4">
          <Button className="text-primary w-full" variant="glass" leftIcon={ArrowUpIcon} label="Send" onClick={onClickSend} />
          <Button
            className="text-primary w-full"
            variant="glass"
            leftIcon={ExternalLinkIcon}
            label="Open in..."
            // onClick={onClickSend}
          />
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
            leftIcon={<Image src={collectionLogo} alt="collection logo" className="rounded-full w-4" />}
            label={collectionName}
          />
        </div>
        <Divider className="my-0" />
        <div className="flex flex-row justify-between items-center">
          <Text variant="normal" color="primary">
            Owner
          </Text>
          <InfoBadge
            leftIcon={<GradientAvatar address={getAddress(tokenBalance?.accountAddress || '')} size="xs" />}
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
