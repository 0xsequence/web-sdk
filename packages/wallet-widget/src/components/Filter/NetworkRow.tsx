import { getNetwork } from '@0xsequence/connect'
import { TokenImage, Text } from '@0xsequence/design-system'

import { ListCardSelect } from '../ListCard'

export const NetworkRow = ({ chainId, isSelected, onClick }: { chainId: number; isSelected: boolean; onClick: () => void }) => {
  const network = getNetwork(chainId)
  const isTestnet = network.testnet
  const title = network.title
  return (
    <ListCardSelect key={chainId} isSelected={isSelected} onClick={onClick}>
      <div className="flex gap-2 justify-center items-center relative">
        {isTestnet && (
          <div
            className="absolute z-1 border rounded-full"
            style={{
              width: '10px',
              height: '10px',
              left: '-1px',
              top: '-1px',
              backgroundColor: '#F4B03E'
            }}
          />
        )}
        <TokenImage src={`https://assets.sequence.info/images/networks/medium/${chainId}.webp`} />
        <Text color="primary" variant="normal" fontWeight="bold">
          {title}
        </Text>
      </div>
    </ListCardSelect>
  )
}
