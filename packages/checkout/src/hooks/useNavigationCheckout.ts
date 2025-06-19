import { useNavigationCheckoutContext, type HistoryCheckout, type NavigationCheckout } from '../contexts/NavigationCheckout.js'

interface UseNavigationCheckout {
  setNavigation: (navigation: NavigationCheckout) => void
  setHistory: (history: HistoryCheckout) => void
  history: HistoryCheckout
  goBack: () => void
  navigation: NavigationCheckout
}

export const useNavigationCheckout = (): UseNavigationCheckout => {
  const { setHistory, history, defaultLocation } = useNavigationCheckoutContext()

  const setNavigation = (navigation: NavigationCheckout) => {
    // Scroll to top of page when navigating to a new page
    const childElement = document.getElementById('sequence-web-sdk-payment-selection-content')
    const parentElement = childElement?.parentElement
    parentElement?.scrollTo(0, 0)

    const newHistory = [...history, navigation]
    setHistory(newHistory)
  }

  const goBack = () => {
    const newHistory = [...history]
    newHistory.pop()
    setHistory(newHistory)
  }

  const navigation = history.length > 0 ? history[history.length - 1] : defaultLocation

  return { setNavigation, history, setHistory, goBack, navigation }
}
