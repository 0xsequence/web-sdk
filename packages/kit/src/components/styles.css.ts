import { globalStyle, style } from '@vanilla-extract/css'

globalStyle('#kit-provider *, #kit-provider::before *, #kit-provider *::after', {
  boxSizing: 'border-box'
})

globalStyle('#kit-wallet *, #kit-wallet::before *, #kit-wallet *::after', {
  boxSizing: 'border-box'
})

export const networkButton = style({
  maxWidth: '400px',
  width: '100%',
  ':hover': {
    cursor: 'pointer',
    opacity: '0.8',
    userSelect: 'none'
  }
})

export const clickable = style({
  ':hover': {
    cursor: 'pointer',
    opacity: '0.8',
    userSelect: 'none'
  }
})

export const walletLogoContainer = style({})

globalStyle(`${walletLogoContainer} svg`, {
  height: '40px'
})

export const walletLogoContainerExtended = style({})

globalStyle(`${walletLogoContainerExtended} svg`, {
  width: '30px'
})

export const walletContent = style({})

// Will affect the close button in the modal
globalStyle(`${walletContent} + button`, {
  backgroundColor: 'transparent'
})

globalStyle(`${walletContent} + button > svg`, {
  width: '20px',
  height: '20px'
})
