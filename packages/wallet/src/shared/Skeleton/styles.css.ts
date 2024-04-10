import { style, keyframes } from '@vanilla-extract/css'

const PulseSimple = keyframes({
  '0%': { opacity: 0.25 },
  '50%': { opacity: 0.1 },
  '100%': { opacity: 0.25 }
})

export const skeleton = style({
  height: '76px',
  backgroundColor: '#909090',
  animation: `${PulseSimple} 2s ease-in-out infinite`
})
