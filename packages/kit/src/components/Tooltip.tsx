import { Card, Text, TooltipPrimitive } from '@0xsequence/design-system'
import { useEffect, useReducer, useRef } from 'react'

export const Tooltip = ({
  message,
  children,
  disabled = false
}: {
  message: string
  children: React.ReactNode
  disabled?: boolean
}) => {
  const [_, forceUpdate] = useReducer(x => x + 1, 0)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    forceUpdate()
  }, [])

  if (disabled) {
    return children
  }

  return (
    <TooltipPrimitive.Provider>
      <TooltipPrimitive.Root delayDuration={0}>
        <TooltipPrimitive.Trigger asChild>
          <div ref={containerRef}>{children}</div>
        </TooltipPrimitive.Trigger>
        <TooltipPrimitive.Portal container={containerRef.current}>
          <TooltipPrimitive.Content className="backdrop-blur-xs bg-background-raised rounded-lg px-4 pb-3 pt-2 shadow-[0_0_10px_0_rgba(0,0,0,0.5)] fill-background-raised">
            <div className="w-full">
              <Text variant="small" fontWeight="medium" color="secondary">
                {message}
              </Text>
              <TooltipPrimitive.Arrow offset={12} width={10} height={5} />
            </div>
            <TooltipPrimitive.Arrow offset={12} width={10} height={5} />
          </TooltipPrimitive.Content>
        </TooltipPrimitive.Portal>
      </TooltipPrimitive.Root>
    </TooltipPrimitive.Provider>
  )
}
