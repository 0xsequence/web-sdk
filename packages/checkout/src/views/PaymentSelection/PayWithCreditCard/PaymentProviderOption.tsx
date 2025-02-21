import { Card, Text } from '@0xsequence/design-system'

interface PaymentProviderOptionProps {
  name: string
  onClick: () => void
  isSelected: boolean
  isRecommended: boolean
  logo: JSX.Element
}

export const PaymentProviderOption = ({ name, onClick, isSelected, isRecommended, logo }: PaymentProviderOptionProps) => {
  return (
    <Card className="flex border-2 border-solid justify-between p-4 cursor-pointer" onClick={onClick}>
      <div className="flex justify-between w-full">
        <div className="flex justify-between items-center gap-3">
          <div className="rounded-xl">{logo}</div>
          <Text variant="normal" fontWeight="bold" color="secondary">
            {name}
          </Text>
        </div>
        <div className="flex flex-row justify-center items-center gap-3">
          {isRecommended && (
            <Text color="muted" variant="small">
              Recommended
            </Text>
          )}
        </div>
      </div>
    </Card>
  )
}
