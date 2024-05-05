import { globalStyle } from '@vanilla-extract/css'

globalStyle('#kit-provider *, #kit-provider::before *, #kit-provider *::after', {
  boxSizing: 'border-box'
})

globalStyle('#kit-wallet *, #kit-wallet::before *, #kit-wallet *::after', {
  boxSizing: 'border-box'
})
