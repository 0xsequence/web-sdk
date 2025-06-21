import { useSharedContext } from '../contexts/Shared.js'

export const useShared = () => {
  const { isGuest, signInDisplay } = useSharedContext()

  return { isGuest, signInDisplay }
}
