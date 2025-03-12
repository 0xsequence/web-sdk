import { useEnvironmentContext } from '../contexts/Environment'

export enum Environment {
  Development = 'development',
  Production = 'production'
}

export interface ConfigureEnvironmentArgs {
  sequenceApisEnv?: Environment
  transakEnv?: Environment
  sardineEnv?: Environment
  devProjectAccessKey?: string
}

export const useEnvironment = () => {
  const {
    isEnabledDevSequenceApis,
    isEnabledDevTransak,
    isEnabledDevSardine,
    devProjectAccessKey,
    setDevProjectAccessKey,
    setIsEnabledDevSequenceApis,
    setIsEnabledDevTransak,
    setIsEnabledDevSardine
  } = useEnvironmentContext()

  return {
    configureEnvironment: (args: ConfigureEnvironmentArgs) => {
      setDevProjectAccessKey(args.devProjectAccessKey || devProjectAccessKey)
      setIsEnabledDevSequenceApis(args.sequenceApisEnv === Environment.Development || isEnabledDevSequenceApis)
      setIsEnabledDevTransak(args.transakEnv === Environment.Development || isEnabledDevTransak)
      setIsEnabledDevSardine(args.sardineEnv === Environment.Development || isEnabledDevSardine)
    },
    devProjectAccessKey,
    isEnabledDevSequenceApis,
    isEnabledDevTransak,
    isEnabledDevSardine
  }
}
