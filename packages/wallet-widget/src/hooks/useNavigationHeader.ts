import { useNavigationHeaderContext } from '../contexts/NavigationHeader.js'

export const useNavigationHeader = () => {
  const { search, selectedTab, setSearch, setSelectedTab } = useNavigationHeaderContext()
  return { search, selectedTab, setSearch, setSelectedTab }
}
