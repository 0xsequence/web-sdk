import { ChevronDownIcon, cn, Field, textVariants } from '@0xsequence/design-system'
import * as SelectPrimitive from '@radix-ui/react-select'
import { forwardRef, type ReactNode, type Ref } from 'react'

type SelectOption = {
  label: string | ReactNode
  value: string
}

export type SelectProps = SelectPrimitive.SelectProps & {
  name: string
  label: string
  value: string
  onValueChange: (value: string) => void
  options: SelectOption[]
}

const SelectItem = forwardRef(({ children, className, ...props }: SelectPrimitive.SelectItemProps, ref: Ref<HTMLDivElement>) => {
  return (
    <SelectPrimitive.Item
      className={cn(
        textVariants({ variant: 'normal' }),
        'flex justify-between items-center px-4 py-3 h-[52px] cursor-pointer rounded-sm',
        'text-base text-primary opacity-100 data-disabled:cursor-default data-disabled:opacity-50',
        'data-highlighted:bg-background-secondary data-[state=checked]:bg-background-control outline-hidden',
        className
      )}
      {...props}
      ref={ref}
    >
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
    </SelectPrimitive.Item>
  )
})

export const Select = forwardRef((props: SelectProps, ref: Ref<HTMLButtonElement>) => {
  const { name, label, options } = props

  return (
    <Field id={name} label={label} labelLocation={'top'} className="grid whitespace-nowrap">
      <SelectPrimitive.Root name={name}>
        <SelectPrimitive.Trigger
          id={name}
          className={cn(
            textVariants({ variant: 'normal' }),
            'inline-flex items-center justify-between gap-1 p-4 h-[52px] bg-background-primary rounded-xl',
            'text-base font-medium text-primary select-none cursor-pointer border-none',
            'outline-hidden ring-inset ring-1 ring-border-normal focus-within:ring-2 focus-within:ring-border-focus focus-within:opacity-100',
            '[&:has(:disabled)]:cursor-default [&:has(:disabled)]:opacity-50',
            '[&:has(:disabled):hover]:cursor-default [&:has(:disabled):hover]:opacity-50'
          )}
          ref={ref}
        >
          <SelectPrimitive.Value />
          <SelectPrimitive.Icon className="inline-flex">
            <ChevronDownIcon />
          </SelectPrimitive.Icon>
        </SelectPrimitive.Trigger>

        <SelectPrimitive.Portal>
          <SelectPrimitive.Content
            position="popper"
            side="bottom"
            align="start"
            className="mt-2 p-1 bg-background-backdrop backdrop-blur-md min-w-[var(--radix-select-trigger-width)] rounded-lg overflow-hidden z-30 outline-hidden ring-inset focus-within:ring-2 focus-within:ring-border-focus max-h-[360px] overflow-y-auto"
          >
            <SelectPrimitive.Viewport>
              <SelectPrimitive.Group className="flex flex-col gap-0.5">
                {options.map(({ value, label, ...rest }) => (
                  <SelectItem key={value} value={value} {...rest}>
                    {label}
                  </SelectItem>
                ))}
              </SelectPrimitive.Group>
            </SelectPrimitive.Viewport>
          </SelectPrimitive.Content>
        </SelectPrimitive.Portal>
      </SelectPrimitive.Root>
    </Field>
  )
})
