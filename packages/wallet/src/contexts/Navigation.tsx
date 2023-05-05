import React, { createContext } from 'react'

export interface Navigation {
  location: 'home' | 'all-coins' | 'all-collections' | 'all-collectibles',
  params?: any
}

type NavigationContext = {
  setNavigation?: React.Dispatch<React.SetStateAction<Navigation>>
}

export const NavigationContext = createContext<NavigationContext>({})