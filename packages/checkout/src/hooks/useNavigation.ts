import { useNavigationContext, Navigation, History } from '../contexts/Navigation'

interface UseNavigation {
  setNavigation: (navigation: Navigation) => void
  setHistory: (history: History) => void
  history: History
  goBack: () => void
  navigation: Navigation
}

export const useNavigation = (): UseNavigation => {
  const { setHistory, history, defaultLocation } = useNavigationContext()

  const setNavigation = (navigation: Navigation) => {
    // Scroll to top of page when navigating to a new page
    const childElement = document.getElementById('sequence-kit-wallet-content')
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
