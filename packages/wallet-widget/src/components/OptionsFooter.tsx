import { cardVariants, cn, Text } from '@0xsequence/design-system'

export const OptionsFooter = ({
  primaryButtonText,
  onPrimaryButtonClick,
  secondaryButtonText,
  onSecondaryButtonClick,
  shape = 'round'
}: {
  primaryButtonText: string
  onPrimaryButtonClick: () => void
  secondaryButtonText?: string
  onSecondaryButtonClick?: () => void
  shape?: 'round' | 'square'
}) => {
  return (
    <div
      className="flex flex-row justify-between items-center p-4 gap-2 w-full"
      style={{ position: 'absolute', bottom: 0, left: 0 }}
    >
      {secondaryButtonText && (
        <div
          className={cn(
            cardVariants({ clickable: true }),
            `flex justify-center items-center bg-button-glass ${shape === 'square' ? 'rounded-lg' : 'rounded-full'} h-11`
          )}
          onClick={onSecondaryButtonClick}
        >
          <Text className="text-primary" variant="normal" fontWeight="bold">
            {secondaryButtonText}
          </Text>
        </div>
      )}

      <div
        className={cn(
          cardVariants({ clickable: true }),
          `flex justify-center items-center bg-gradient-primary ${shape === 'square' ? 'rounded-lg' : 'rounded-full'} h-11`
        )}
        onClick={onPrimaryButtonClick}
      >
        <Text className="text-primary" variant="normal" fontWeight="bold">
          {primaryButtonText}
        </Text>
      </div>
    </div>
  )
}
