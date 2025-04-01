import { useThemeContext } from '../contexts/Theme'

/**
 * Hook to access and modify the theme and modal position settings.
 *
 * This hook provides access to the current theme (light/dark) and modal position settings,
 * along with functions to update these values. The modal position can be set to various
 * predefined positions on the screen.
 *
 * @see {@link https://docs.sequence.xyz/sdk/web/hooks/useTheme} for more detailed documentation.
 *
 * @returns {Object} An object containing:
 * - `theme` - The current theme setting
 * - `setTheme` - Function to update the theme
 * - `position` - The current modal position ('center', 'top-right', 'bottom-left', etc.)
 * - `setPosition` - Function to update the modal position
 *
 * @example
 * ```tsx
 * const { theme, setTheme, position, setPosition } = useTheme()
 *
 * // Change theme
 * setTheme('dark')
 *
 * // Update modal position
 * setPosition('top-right')
 * ```
 */
export const useTheme = () => {
  const { setTheme, theme, position, setPosition } = useThemeContext()

  return {
    setTheme,
    theme,
    position,
    setPosition
  }
}
