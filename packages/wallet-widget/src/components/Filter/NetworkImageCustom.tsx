import { getNetwork } from '@0xsequence/connect'
import { NetworkImage } from '@0xsequence/design-system'

export const NetworkImageCustom = ({
  chainId,
  indicatorPosition = 'top-left',
  style,
  className
}: {
  chainId: number
  indicatorPosition?: 'top-left' | 'top-right'
  style?: React.CSSProperties
  className?: string
}) => {
  const network = getNetwork(chainId)
  const isTestnet = network.testnet
  return (
    <div className="relative overflow-visible">
      {isTestnet && (
        <div
          className="absolute z-1 border rounded-full"
          style={{
            minWidth: '6px',
            minHeight: '6px',
            width: '30%',
            height: '30%',
            ...(indicatorPosition === 'top-left' && { left: '-1px', top: '-1px' }),
            ...(indicatorPosition === 'top-right' && { right: '-1px', top: '-1px' }),
            backgroundColor: '#F4B03E'
          }}
        />
      )}

      <NetworkImage className={className} chainId={chainId} style={{ ...style }} />
    </div>
  )
}
