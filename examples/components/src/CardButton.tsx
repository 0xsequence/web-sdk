import { Card, Text, Spinner } from '@0xsequence/design-system'

interface CardButtonProps {
  title: string
  description: string
  onClick: () => void
  isPending?: boolean
}

export const CardButton = (props: CardButtonProps) => {
  const { title, description, onClick, isPending } = props

  return (
    <Card clickable onClick={onClick}>
      <Text variant="normal" fontWeight="bold" color="primary">
        {title}
      </Text>
      <Text className="mt-2" variant="normal" color="muted" asChild>
        <div>{description}</div>
      </Text>
      {isPending && (
        <div className="flex gap-2 items-center mt-4">
          <Spinner size="sm" />
          <Text variant="small" color="muted">
            Pending...
          </Text>
        </div>
      )}
    </Card>
  )
}
