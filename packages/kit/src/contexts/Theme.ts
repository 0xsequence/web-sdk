import React from 'react'

import { Theme } from '../index'
import { createGenericContext, ModalPosition } from '../utils'

type ThemeContext = {
  setTheme: React.Dispatch<React.SetStateAction<Theme>>
  theme: Theme
  position: ModalPosition
  setPosition: React.Dispatch<React.SetStateAction<ModalPosition>>
}

export const [useThemeContext, ThemeContextProvider] = createGenericContext<ThemeContext>()
