'use client'

import type { Theme } from '@0xsequence/design-system'
import { createGenericContext, type ModalPosition } from '@0xsequence/web-sdk-core'
import type { Dispatch, SetStateAction } from 'react'

type ThemeContext = {
  setTheme: Dispatch<SetStateAction<Theme>>
  theme: Theme
  position: ModalPosition
  setPosition: Dispatch<SetStateAction<ModalPosition>>
}

const [useThemeContext, ThemeContextProvider] = createGenericContext<ThemeContext>()

export { ThemeContextProvider, useThemeContext }
