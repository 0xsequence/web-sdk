import { useKitConfig } from '../contexts/KitConfig'

export const useProjectAccessKey = () => {
  const { projectAccessKey } = useKitConfig()

  return projectAccessKey
}
