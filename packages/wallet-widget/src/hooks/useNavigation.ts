import { useNavigationContext, type History, type Navigation } from '../contexts/Navigation.js'

interface UseNavigation {
  setNavigation: (navigation: Navigation) => void
  setHistory?: (history: History) => void
  history: History
  goBack: () => void
}

/**
 * Hook for managing navigation state and history within the wallet widget.
 * Provides functions to navigate between views and maintain navigation history.
 * Automatically handles scrolling to the top of the view on navigation.
 *
 * @returns {UseNavigation} Navigation control object containing:
 * - `setNavigation`: Function to navigate to a new view. Automatically manages history:
 *   - If navigating to 'home', clears history
 *   - Otherwise, adds new location to history stack
 * - `history`: Current navigation history stack
 * - `setHistory`: Direct history manipulation (use setNavigation instead when possible)
 * - `goBack`: Function to navigate back to previous view
 *
 * @see {@link https://docs.sequence.xyz/sdk/web/hooks/useNavigation} for more detailed documentation.
 *
 * @example
 * function SendView() {
 *   const { setNavigation, goBack } = useNavigation()
 *
 *   const handleSend = () => {
 *     // Navigate to confirmation view
 *     setNavigation({
 *       location: 'send-confirmation',
 *       params: { amount, recipient }
 *     })
 *   }
 *
 *   const handleCancel = () => {
 *     // Go back to previous view
 *     goBack()
 *   }
 *
 *   return (
 *     <div>
 *       <button onClick={handleSend}>Send</button>
 *       <button onClick={handleCancel}>Cancel</button>
 *     </div>
 *   )
 * }
 */
export const useNavigation = (): UseNavigation => {
  const { setHistory, history } = useNavigationContext()

  const setNavigation = (navigation: Navigation) => {
    // Scroll to top of page when navigating to a new page
    const childElement = document.getElementById('sequence-kit-wallet-content')
    const parentElement = childElement?.parentElement
    parentElement?.scrollTo(0, 0)

    const newHistory = navigation.location === 'home' ? [] : [...history, navigation]
    setHistory(newHistory)
  }

  const goBack = () => {
    const newHistory = [...history]
    newHistory.pop()
    setHistory(newHistory)
  }

  return { setNavigation, history, setHistory, goBack }
}
