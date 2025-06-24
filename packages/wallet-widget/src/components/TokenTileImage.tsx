import { Card, Image, Text } from '@0xsequence/design-system'

interface TokenTileImageProps {
  src?: string
  symbol?: string
}

export const TokenTileImage = ({ src, symbol }: TokenTileImageProps) => {
  let symbolLabel

  const abrevSymbol = symbol
    ?.split(' ')
    .map(word => word[0])
    .join('')
  const shortSymbol = symbol?.replace(/\s/, '').slice(0, 6)

  if (abrevSymbol && abrevSymbol.length > 2) {
    symbolLabel = abrevSymbol
  } else {
    symbolLabel = shortSymbol
  }

  return (
    <Card className="flex p-0 aspect-square justify-center items-center overflow-hidden rounded-lg bg-background-secondary">
      {src ? (
        <Image className="h-full" src={src} />
      ) : (
        <Text variant="inherit" fontWeight="medium" color="muted" uppercase>
          {symbolLabel}
        </Text>
      )}
    </Card>
  )
}
