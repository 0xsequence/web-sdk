import { style, globalStyle } from '@vanilla-extract/css'

export const walletContent = style({})

// Will affect the close button in the modal
globalStyle(`${walletContent} + button`, {
  backgroundColor: 'transparent'
})

globalStyle(`${walletContent} + button > svg`, {
  width: '20px',
  height: '20px'
})
