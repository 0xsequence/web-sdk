import { useCallback, useEffect, useState } from 'react'

export function useLocalState<T>(key: string, initialValue: T) {
  const [state, setState] = useState<T>(() => {
    const storedValue = localStorage.getItem(key)
    if (!storedValue) {
      return initialValue
    }
    try {
      return JSON.parse(storedValue)
    } catch {
      // If parsing fails, it might be a string enum value
      return storedValue as T
    }
  })

  useEffect(() => {
    if (typeof state === 'string') {
      localStorage.setItem(key, state)
    } else {
      localStorage.setItem(key, JSON.stringify(state))
    }
  }, [key, state])

  const updateState = useCallback((value: T | ((prev: T) => T)) => {
    setState(value)
  }, [])

  return [state, updateState] as const
}
