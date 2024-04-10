import { style, globalStyle } from '@vanilla-extract/css'

export const insufficientBalanceButton = style({})

globalStyle(`${insufficientBalanceButton} > div`, {
  justifyContent: 'center'
})
