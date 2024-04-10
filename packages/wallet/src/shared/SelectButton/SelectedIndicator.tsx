import React from 'react'
import { Box, CheckmarkIcon, vars } from '@0xsequence/design-system'
import { motion } from 'framer-motion'

interface SelectedIndicatorProps {
  selected: boolean
  squareIndicator?: boolean
  className?: string
}

export const SelectedIndicator = (props: SelectedIndicatorProps) => {
  const { selected, className, squareIndicator = false } = props
  return (
    <Box
      borderStyle="solid"
      borderColor={squareIndicator && selected ? 'transparent' : 'borderNormal'}
      borderWidth="thin"
      position="relative"
      alignItems="center"
      justifyContent="center"
      flexShrink="0"
      className={className}
      style={{
        borderRadius: squareIndicator ? '4px' : vars.radii.circle,
        width: '20px',
        height: '20px'
      }}
    >
      <Box
        as={motion.div}
        background={squareIndicator ? 'borderNormal' : 'backgroundInverse'}
        position="absolute"
        color="textInverse100"
        initial={{ opacity: selected ? 1 : 0, scale: selected ? 1 : 0.5 }}
        animate={{ opacity: selected ? 1 : 0, scale: selected ? 1 : 0.5 }}
        transition={{ ease: 'backOut' }}
        style={{
          borderRadius: squareIndicator ? '4px' : vars.radii.circle,
          width: squareIndicator ? '20px' : '14px',
          height: squareIndicator ? '20px' : '14px'
        }}
        justifyContent="center"
        alignItems="center"
      >
        {squareIndicator && <CheckmarkIcon color="white" style={{ width: '14px', height: '14px' }} />}
      </Box>
    </Box>
  )
}
