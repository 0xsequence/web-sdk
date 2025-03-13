import { useContext } from 'react'

import { SequenceHooksContext } from '../contexts/ConfigContext'

export const useConfig = () => {
  const config = useContext(SequenceHooksContext)

  if (!config) {
    throw new Error('useConfig must be used within a SequenceHooksProvider')
  }

  return config
}
