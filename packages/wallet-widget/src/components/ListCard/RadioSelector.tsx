import { CheckmarkIcon } from '@0xsequence/design-system'
import { motion } from 'motion/react'

interface RadioSelectorProps {
  isSelected: boolean
  className?: string
}

export const RadioSelector = (props: RadioSelectorProps) => {
  const { isSelected, className } = props
  return (
    <div className={`${className} border-2 border-border-normal bg-background-muted rounded-full relative shrink-0 w-9 h-9`}>
      <motion.div
        // TODO: change color to violet-600
        className="flex bg-background-inverse absolute items-center justify-center rounded-full text-inverse w-9 h-9"
        initial={{ opacity: isSelected ? 1 : 0, scale: isSelected ? 1 : 0.5 }}
        animate={{ opacity: isSelected ? 1 : 0, scale: isSelected ? 1 : 0.5 }}
        transition={{ ease: 'backOut' }}
        style={{
          top: '-2px',
          left: '-2px'
        }}
      >
        <CheckmarkIcon />
      </motion.div>
    </div>
  )
}
