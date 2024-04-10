import React from 'react'
import { Box, BoxProps } from '@0xsequence/design-system'

import * as styles from './styles.css'

interface SkeletonProps {
  width?: number | string
  height?: number | string
  borderRadius?: BoxProps['borderRadius']
}

export const Skeleton = ({ width = '100%', height = '100%', borderRadius = 'md' }: SkeletonProps) => {
  return <Box className={styles.skeleton} borderRadius={borderRadius} style={{ width, height }} />
}
