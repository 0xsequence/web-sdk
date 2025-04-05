// import { SessionTypes } from '@walletconnect/types'
// import { Observable } from 'micro-observables'

// import { ConnectOptions } from '../components/SequenceWalletProvider/utils/WalletConnectSignClient'

// import { createGenericContext } from './genericContext'

// export interface WalletConnectContextProps {
//   isReadyObservable: Observable<boolean>
//   sessionsObservable: Observable<SessionTypes.Struct[]>
//   connectOptionsObservable: Observable<ConnectOptions | undefined>
//   pair: (uri: string) => Promise<void>
//   rejectRequest: () => void
//   disconnectSession: (topic: string) => Promise<void>
//   disconnectAllSessions: () => Promise<void>
// }

// export const [useWalletConnectContext, WalletConnectContextProvider] = createGenericContext<WalletConnectContextProps>()
