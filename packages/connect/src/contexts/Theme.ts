'use client'

import { Theme } from '@0xsequence/design-system'
import React from 'react'

import { ModalPosition } from '../index'

import { createGenericContext } from './genericContext'

type ThemeContext = {
  setTheme: React.Dispatch<React.SetStateAction<Theme>>
  theme: Theme
  position: ModalPosition
  setPosition: React.Dispatch<React.SetStateAction<ModalPosition>>
}

const [useThemeContext, ThemeContextProvider] = createGenericContext<ThemeContext>()

export { useThemeContext, ThemeContextProvider }
