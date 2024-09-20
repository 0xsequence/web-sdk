import { Box, TokenImage, NetworkImage } from '@0xsequence/design-system'

const SIZE = 16

interface TokenWithChainImageProps {
  src?: string
  symbol: string
  chainId: number
}

export const TokenWithChainImage = (props: TokenWithChainImageProps) => {
  const { src, symbol, chainId } = props

  return (
    <Box position="relative">
      <TokenImage size="lg" src={src} symbol={symbol} />
      <Box
        position="absolute"
        zIndex="1"
        borderRadius="circle"
        borderWidth="thin"
        borderStyle="solid"
        borderColor="backgroundPrimary"
        background="backgroundPrimary"
        placeItems="center"
        style={{ width: SIZE + 2, height: SIZE + 2, right: -2, bottom: -2 }}
      >
        <NetworkImage chainId={chainId} style={{ width: SIZE, height: SIZE }} />
      </Box>
    </Box>
  )
}
