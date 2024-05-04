import { style } from '@vanilla-extract/css'

export const scrollbar = style({
  /* @ts-ignore-next-line */
  '> div': {
    overflowY: 'scroll'
  }
})
