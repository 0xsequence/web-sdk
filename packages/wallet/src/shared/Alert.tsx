import { Button, Text } from '@0xsequence/design-system'
import React, { ComponentProps } from 'react'

export type AlertProps = {
  title: string
  description: string
  secondaryDescription?: string
  variant: 'negative' | 'warning' | 'positive'
  buttonProps?: ComponentProps<typeof Button>
  children?: React.ReactNode
}

export const Alert = ({ title, description, secondaryDescription, variant, buttonProps, children }: AlertProps) => {
  return (
    <div className="rounded-xl">
      <div className="flex bg-background-overlay rounded-xl py-4 w-full flex-col gap-3">
        <div className="flex w-full gap-2 justify-between">
          <div className="flex flex-col gap-1">
            <Text variant="normal" color="text100" fontWeight="medium">
              {title}
            </Text>

            <Text variant="normal" color="text50" fontWeight="medium">
              {description}
            </Text>

            {secondaryDescription && (
              <Text variant="normal" color="text80" fontWeight="medium">
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
