import { getNetwork } from '@0xsequence/connect'
import { Text } from '@0xsequence/design-system'

import { ListCardSelect } from '../ListCard'

import { NetworkImageCustom } from './NetworkImageCustom'

export const NetworkRow = ({ chainId, isSelected, onClick }: { chainId: number; isSelected: boolean; onClick: () => void }) => {
  const network = getNetwork(chainId)
  const title = network.title
  return (
    <ListCardSelect key={chainId} isSelected={isSelected} onClick={onClick}>
      <div className="flex gap-2 justify-center items-center">
        <NetworkImageCustom chainId={chainId} style={{ width: '32px', height: '32px' }} />
        <Text color="primary" variant="normal" fontWeight="bold">
          {title}
        </Text>
      </div>
    </ListCardSelect>
  )
}
