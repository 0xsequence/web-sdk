import { globalStyle, style } from '@vanilla-extract/css'
import { textVariants, vars } from '@0xsequence/design-system'

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

export const googleWaasButtonContainer = style({})

globalStyle(`${googleWaasButtonContainer}`, {
  width: '40px',
  height: '40px',
  overflow: 'hidden',
  borderRadius: '4px',
  alignItems: 'center',
  justifyContent: 'center'
})

export const digitInput = style([
  textVariants({ variant: 'large' }),
  {
    height: '48px',
    width: '40px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '10px',
    border: `${vars.borderWidths.thick} solid ${vars.colors.borderNormal}`,
    borderRadius: vars.radii.sm,
    color: vars.colors.text100,
    background: 'transparent',
    textAlign: 'center',
    caretColor: 'transparent',

    boxShadow: 'none',

    ':hover': {
      borderColor: vars.colors.borderFocus
    },

    ':focus': {
      borderColor: vars.colors.borderFocus
    },

    '::selection': {
      background: 'transparent'
    }
  }
])
