import { Button, cn, Text } from '@0xsequence/design-system'
import React, { type ComponentProps } from 'react'

export type AlertProps = {
  title: string
  description: string
  secondaryDescription?: string
  variant: 'negative' | 'warning' | 'positive'
  buttonProps?: ComponentProps<typeof Button>
  children?: React.ReactNode
}

const variants = {
  negative: 'bg-negative',
  warning: 'bg-warning',
  positive: 'bg-positive'
}

export const Alert = ({ title, description, secondaryDescription, variant, buttonProps, children }: AlertProps) => {
  return (
    <div className={cn('rounded-xl', variants[variant])}>
      <div className="flex bg-background-overlay rounded-xl p-4 w-full flex-col gap-3">
        <div className="flex w-full gap-2 justify-between">
          <div className="flex flex-col gap-1">
            <Text variant="normal" color="primary" fontWeight="medium">
              {title}
            </Text>

            <Text variant="normal" color="muted" fontWeight="medium">
              {description}
            </Text>

            {secondaryDescription && (
              <Text variant="normal" color="secondary" fontWeight="medium">
                {secondaryDescription}
              </Text>
            )}
          </div>

          {buttonProps ? (
            <div className="rounded-lg w-min h-min">
              <Button className="shrink-0" variant="emphasis" shape="square" {...buttonProps} />
            </div>
          ) : null}
        </div>

        {children}
      </div>
    </div>
  )
}
