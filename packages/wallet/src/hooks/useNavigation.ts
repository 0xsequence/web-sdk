import { useNavigationContext, Navigation, History } from '../contexts/Navigation'

interface UseNavigation {
  setNavigation: (navigation: Navigation) => void
  setHistory?: (history: History) => void
  history: History
  goBack: () => void
}

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
