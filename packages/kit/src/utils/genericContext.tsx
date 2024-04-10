import React from 'react'

// https://medium.com/@rivoltafilippo/typing-react-context-to-avoid-an-undefined-default-value-2c7c5a7d5947

export const createGenericContext = <T extends unknown>() => {
  // Create a context with a generic parameter or undefined
  const genericContext = React.createContext<T | undefined>(undefined)

  // Check if the value provided to the context is defined or throw an error
  const useGenericContext = () => {
    const contextIsDefined = React.useContext(genericContext)
    if (!contextIsDefined) {
      throw new Error('useGenericContext must be used within a Provider')
    }
    return contextIsDefined
  }

  return [useGenericContext, genericContext.Provider] as const
}
