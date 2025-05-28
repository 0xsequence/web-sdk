import { Image, Text } from '@0xsequence/design-system'

export const CollectibleHeader = ({ imgSrc, imgLabel }: { imgSrc?: string; imgLabel?: string }) => {
  return (
    <div className="flex flex-row items-center h-full w-full">
      <div className="px-3">
        <Image
          className="w-9 h-9"
          src={imgSrc}
          alt={imgLabel}
          style={{
            objectFit: 'cover'
          }}
        />
      </div>
      <div className="flex flex-col">
        <Text variant="medium" color="text100">
          {imgLabel}
        </Text>
      </div>
    </div>
  )
}
