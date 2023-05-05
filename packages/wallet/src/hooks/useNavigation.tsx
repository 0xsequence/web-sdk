import { useContext } from 'react'
import { NavigationContext } from '../contexts/Navigation'

export const useNavigation = () => {
  const { setNavigation } = useContext(NavigationContext)

  return setNavigation
}