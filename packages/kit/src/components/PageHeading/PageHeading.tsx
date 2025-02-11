import { Text } from '@0xsequence/design-system'

interface PageHeadingProps extends BoxProps {}

export const PageHeading = (props: PageHeadingProps) => {
  const { children, ...rest } = props
  return (
    <Text className="text-center mt-10 mb-6" variant="normal" fontWeight="bold" color="text100" asChild>
      <h1 {...rest}>{children}</h1>
    </Text>
  )
}
