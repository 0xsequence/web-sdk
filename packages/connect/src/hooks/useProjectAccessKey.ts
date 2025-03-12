import { useConnectConfigContext } from '../contexts/ConnectConfig'

export const useProjectAccessKey = () => {
  const { projectAccessKey } = useConnectConfigContext()

  return projectAccessKey
}
