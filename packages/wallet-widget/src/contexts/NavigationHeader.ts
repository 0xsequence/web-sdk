import { createGenericContext } from './genericContext.js'

export interface NavigationHeaderContext {
  search: string
  selectedTab: 'tokens' | 'collectibles' | 'history'
  setSearch: (search: string) => void
  setSelectedTab: (tab: 'tokens' | 'collectibles' | 'history') => void
}

const [useNavigationHeaderContext, NavigationHeaderContextProvider] = createGenericContext<NavigationHeaderContext>()

export { NavigationHeaderContextProvider, useNavigationHeaderContext }
