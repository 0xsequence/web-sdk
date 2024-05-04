import { globalStyle, style } from '@vanilla-extract/css'
import { textVariants, vars } from '@0xsequence/design-system'

globalStyle('#kit-provider *, #kit-provider::before *, #kit-provider *::after', {
  boxSizing: 'border-box'
})

globalStyle('#kit-wallet *, #kit-wallet::before *, #kit-wallet *::after', {
  boxSizing: 'border-box'
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
