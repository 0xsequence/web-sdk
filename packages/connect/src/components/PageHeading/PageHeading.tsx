import { cn, Text } from '@0xsequence/design-system'
import type { ReactNode } from 'react'

interface PageHeadingProps {
  children: ReactNode
  className?: string
}

export const PageHeading = (props: PageHeadingProps) => {
  const { children, className, ...rest } = props

  return (
    <Text className={cn('text-center mt-10 mb-6', className)} variant="normal" fontWeight="bold" color="primary" asChild>
      <h1 {...rest}>{children}</h1>
    </Text>
  )
}
