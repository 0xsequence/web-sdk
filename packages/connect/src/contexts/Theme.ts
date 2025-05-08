'use client'

import type { Theme } from '@0xsequence/design-system'
import type { Dispatch, SetStateAction } from 'react'

import type { ModalPosition } from '../index'

import { createGenericContext } from './genericContext'

type ThemeContext = {
  setTheme: Dispatch<SetStateAction<Theme>>
  theme: Theme
  position: ModalPosition
  setPosition: Dispatch<SetStateAction<ModalPosition>>
}

const [useThemeContext, ThemeContextProvider] = createGenericContext<ThemeContext>()

export { ThemeContextProvider, useThemeContext }
