import { useContext } from 'react'

import { ReactHooksConfigContext } from '../contexts/ConfigContext'

export const useConfig = () => {
  const config = useContext(ReactHooksConfigContext)

  if (!config) {
    throw new Error('useConfig must be used within a ConfigProvider')
  }

  return config
}
