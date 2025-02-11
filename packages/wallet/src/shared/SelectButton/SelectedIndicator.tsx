import { CheckmarkIcon, cn } from '@0xsequence/design-system'
import { motion } from 'motion/react'
import React from 'react'

interface SelectedIndicatorProps {
  selected: boolean
  squareIndicator?: boolean
  className?: string
}

export const SelectedIndicator = (props: SelectedIndicatorProps) => {
  const { selected, className, squareIndicator = false } = props
  return (
    <div
      className={cn(
        `w-5 h-5 flex border-solid border-1 relative items-center justify-center shrink-0 border-border-normal`,
        squareIndicator ? 'rounded-sm' : 'rounded-full',
        className
      )}
    >
      <motion.div
        className={cn(
          'flex absolute text-text-inverse100 justify-center items-center bg-border-normal',
          squareIndicator ? 'rounded-sm w-5 h-5' : 'rounded-full w-[14px] h-[14px]'
        )}
        initial={{ opacity: selected ? 1 : 0, scale: selected ? 1 : 0.5 }}
        animate={{ opacity: selected ? 1 : 0, scale: selected ? 1 : 0.5 }}
        transition={{ ease: 'backOut' }}
      >
        {squareIndicator && <CheckmarkIcon className="text-white w-[14px] h-[14px]" />}
      </motion.div>
    </div>
  )
}
