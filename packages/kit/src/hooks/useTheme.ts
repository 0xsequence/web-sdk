import React from 'react'
import { useThemeContext } from '../contexts/Theme'

export const useTheme = () => {
  const { setTheme, theme, position, setPosition } = useThemeContext()

  return {
    setTheme,
    theme,
    position,
    setPosition
  }
}
