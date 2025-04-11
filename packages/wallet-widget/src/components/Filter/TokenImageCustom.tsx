import { TokenImage } from '@0xsequence/design-system'

import { NetworkImageCustom } from './NetworkImageCustom'

const NETWORK_IMAGE_SIZE = '45%'
const NETWORK_IMAGE_OFFSET = '-1px'

export const TokenImageCustom = ({
  src,
  symbol,
  chainId
}: {
  src: string | undefined
  symbol: string | undefined
  chainId: number
}) => {
  return (
    <div className="relative rounded-full bg-background-muted">
      <div
        className="absolute z-1"
        style={{
          width: NETWORK_IMAGE_SIZE,
          height: NETWORK_IMAGE_SIZE,
          bottom: NETWORK_IMAGE_OFFSET,
          right: NETWORK_IMAGE_OFFSET
        }}
      >
        <NetworkImageCustom
          className="border"
          chainId={chainId}
          indicatorPosition="top-right"
          style={{
            width: '100%',
            height: '100%'
          }}
        />
      </div>

      <TokenImage src={src} symbol={symbol} />
    </div>
  )
}
