import { BoxProps, Text } from '@0xsequence/design-system'

interface PageHeadingProps extends BoxProps {}

export const PageHeading = (props: PageHeadingProps) => {
  const { children, ...rest } = props
  return (
    <Text as="h1" variant="normal" fontWeight="bold" color="text100" textAlign="center" marginTop="10" marginBottom="6" {...rest}>
      {children}
    </Text>
  )
}
