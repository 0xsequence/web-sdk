import { useConnectConfigContext } from '../contexts/ConnectConfig.js'

export const useProjectAccessKey = () => {
  const { projectAccessKey } = useConnectConfigContext()

  return projectAccessKey
}
