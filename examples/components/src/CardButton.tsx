import { Card, Box, Text, Spinner } from '@0xsequence/design-system'

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
      <Text variant="normal" fontWeight="bold" color="text100">
        {title}
      </Text>
      <Text as="div" variant="normal" color="text50" marginTop="2">
        {description}
      </Text>

      {isPending && (
        <Box gap="2" alignItems="center" marginTop="4">
          <Spinner size="sm" />
          <Text variant="small" color="text50">
            Pending...
          </Text>
        </Box>
      )}
    </Card>
  )
}
