import { useContext } from 'react'

import { KitHooksConfigContext } from '../contexts/ConfigContext'

export const useConfig = () => {
  const config = useContext(KitHooksConfigContext)

  if (!config) {
    throw new Error('useConfig must be used within a ConfigProvider')
  }

  return config
}
