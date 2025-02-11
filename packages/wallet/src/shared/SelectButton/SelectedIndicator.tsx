import { CheckmarkIcon } from '@0xsequence/design-system';
import { motion } from 'framer-motion'
import React from 'react'

interface SelectedIndicatorProps {
  selected: boolean
  squareIndicator?: boolean
  className?: string
}

export const SelectedIndicator = (props: SelectedIndicatorProps) => {
  const { selected, className, squareIndicator = false } = props
  return (
    (<div
      className={`${className} flex border-solid border-1 relative items-center justify-center shrink-0`}
      style={{
        borderRadius: squareIndicator ? '4px' : vars.radii.circle,
        width: '20px',
        height: '20px'
      }}>
      <motion.div
        className="flex absolute text-text-inverse100 justify-center items-center"
        initial={{ opacity: selected ? 1 : 0, scale: selected ? 1 : 0.5 }}
        animate={{ opacity: selected ? 1 : 0, scale: selected ? 1 : 0.5 }}
        transition={{ ease: 'backOut' }}
        style={{
          borderRadius: squareIndicator ? '4px' : vars.radii.circle,
          width: squareIndicator ? '20px' : '14px',
          height: squareIndicator ? '20px' : '14px'
        }}>
        {squareIndicator && <CheckmarkIcon className="text-white" style={{ width: '14px', height: '14px' }} />}
      </motion.div>
    </div>)
  );
}
