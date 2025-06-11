import { getNetwork } from '@0xsequence/connect'
import { Text } from '@0xsequence/design-system'

import { NetworkImageCustom } from '../Filter/NetworkImageCustom.js'

import { ListCard } from './ListCard.js'

export const ListCardNetwork = ({
  chainId,
  isSelected = false,
  onClick = () => {}
}: {
  chainId: number
  isSelected?: boolean
  onClick?: () => void
}) => {
  const network = getNetwork(chainId)
  const title = network.title

  return (
    <ListCard type={isSelected ? 'radio' : 'default'} onClick={onClick} isSelected={isSelected}>
      <div className="flex gap-2 justify-center items-center">
        <NetworkImageCustom chainId={chainId} style={{ width: '32px', height: '32px' }} />
        <Text color="primary" variant="normal" fontWeight="bold">
          {title}
        </Text>
      </div>
    </ListCard>
  )
}
