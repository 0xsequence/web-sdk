import { useNavigationContext, Navigation, History } from '../contexts/Navigation'
import { DEFAULT_LOCATION } from '../shared/components/KitCheckoutProvider'

interface UseNavigation {
  setNavigation: (navigation: Navigation) => void
  setHistory: (history: History) => void
  history: History
  goBack: () => void
  navigation: Navigation
}

export const useNavigation = (): UseNavigation => {
  const { setHistory, history } = useNavigationContext()

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

  const navigation = history.length > 0 ? history[history.length - 1] : DEFAULT_LOCATION

  return { setNavigation, history, setHistory, goBack, navigation }
}
