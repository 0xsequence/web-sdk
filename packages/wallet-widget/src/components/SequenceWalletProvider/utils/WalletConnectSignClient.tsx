// import SignClient from '@walletconnect/sign-client'
// import { SessionTypes, SignClientTypes } from '@walletconnect/types'
// import { observable } from 'micro-observables'
// import { useEffect, useRef } from 'react'
// import { ReactNode } from 'react'
// import { useAccount } from 'wagmi'

// import { WalletConnectContextProvider } from '../../../contexts/WalletConnect'
// import { useSettings } from '../../../hooks'

// const SEQUENCE_WALLET_PROJECT_ID = '9de6e0953fc26670a19deea966e9ae1f'

// interface WalletConnectProviderProps {
//   children: ReactNode
// }

// export interface ConnectOptions {
//   app: string
//   origin: string
//   networkId: string
//   keepWalletOpened: boolean
// }

// export const WalletConnectProvider: React.FC<WalletConnectProviderProps> = ({ children }) => {
//   const { address } = useAccount()
//   const { selectedNetworks } = useSettings()

//   const isReadyObservable = observable<boolean>(false)
//   const sessionsObservable = observable<SessionTypes.Struct[]>([])
//   const connectOptionsObservable = observable<ConnectOptions | undefined>(undefined)

//   const currentRequestInfoRef = useRef<{ id: number; topic: string } | undefined>(undefined)
//   const signClientRef = useRef<SignClient | undefined>(undefined)

//   useEffect(() => {
//     const createSignClient = async () => {
//       const client = await SignClient.init({
//         projectId: SEQUENCE_WALLET_PROJECT_ID,
//         metadata: {
//           name: 'Sequence Wallet',
//           description: 'Sequence Wallet - The Best Crypto, NFT & Web3 Wallet',
//           url: 'https://sequence.app',
//           icons: ['https://sequence.app/apple-touch-icon.png']
//         }
//       })

//       client.on('session_proposal', onSessionProposal)
//       client.on('session_request', onSessionRequest)
//       client.on('session_ping', onSessionPing)
//       client.on('session_event', onSessionEvent)
//       client.on('session_update', onSessionUpdate)
//       client.on('session_delete', onSessionDelete)

//       signClientRef.current = client
//       sessionsObservable.set(client.session.getAll() ?? [])
//       isReadyObservable.set(true)
//     }

//     createSignClient()
//   }, [])

//   const pair = async (uri: string) => {
//     if (!signClientRef.current) {
//       throw new Error('WalletConnect signClient not initialized.')
//     }

//     await signClientRef.current?.core.pairing.pair({ uri })
//   }

//   const rejectRequest = () => {
//     if (currentRequestInfoRef.current) {
//       signClientRef.current?.respond({
//         topic: currentRequestInfoRef.current.topic,
//         response: {
//           id: currentRequestInfoRef.current.id,
//           jsonrpc: '2.0',
//           error: {
//             message: 'User rejected.',
//             code: 4001
//           }
//         }
//       })
//     }
//   }

//   const disconnectSession = async (topic: string) => {
//     const session = signClientRef.current?.session.get(topic)

//     if (session) {
//       await signClientRef.current?.engine.client.disconnect({
//         topic: session.topic,
//         reason: {
//           message: 'User disconnected.',
//           code: 6000
//         }
//       })

//       sessionsObservable.set(signClientRef.current?.session.getAll() ?? [])
//     }
//   }

//   const disconnectAllSessions = async () => {
//     const sessions = signClientRef.current?.session.getAll() ?? []
//     sessions.forEach(async session => {
//       await signClientRef.current?.engine.client.disconnect({
//         topic: session.topic,
//         reason: {
//           message: 'User disconnected.',
//           code: 6000
//         }
//       })
//     })

//     sessionsObservable.set([])
//   }

//   const onSessionProposal = async (ev: SignClientTypes.EventArguments['session_proposal']) => {
//     console.log('onSessionProposal', ev)

//     console.log('signClientRef.current', signClientRef.current)

//     const requiredNamespaces = ev.params.requiredNamespaces
//     const optionalNamespaces = ev.params.optionalNamespaces

//     const chainsInRequiredNamespaces =
//       Object.keys(requiredNamespaces).length === 0 ? [] : (requiredNamespaces.eip155.chains ?? [])
//     const chainsInOptionalNamespaces =
//       Object.keys(optionalNamespaces).length === 0 ? [] : (optionalNamespaces.eip155.chains ?? [])

//     const chainId = chainsInRequiredNamespaces[0]?.split(':').pop() ?? chainsInOptionalNamespaces[0]?.split(':').pop()

//     if (!chainId) {
//       throw new Error('No chainId found in WalletConnect session proposal namespaces.')
//     }

//     connectOptionsObservable.set({
//       app: ev.params.proposer.metadata.name,
//       origin: ev.params.proposer.metadata.url,
//       networkId: chainId,
//       keepWalletOpened: true
//     })

//     const chains = selectedNetworks
//     const requestedChains = chainsInRequiredNamespaces.map(chain => Number(chain.split(':').pop()))
//     const optionalChains = chainsInOptionalNamespaces.map(chain => Number(chain.split(':').pop()))
//     const filteredChainsForRequested = chains.filter(chain => [...requestedChains, ...optionalChains].includes(chain))

//     const accounts = filteredChainsForRequested.map(chain => 'eip155:' + chain + ':' + address)

//     const namespaces = {
//       eip155: {
//         accounts,
//         methods: [
//           'eth_sendTransaction',
//           'eth_sendRawTransaction',
//           'eth_signTransaction',
//           'eth_sign',
//           'personal_sign',
//           'eth_signTypedData',
//           'eth_signTypedData_v4',
//           'wallet_switchEthereumChain'
//         ],
//         chains: [],
//         events: ['chainChanged', 'accountsChanged', 'connect', 'disconnect']
//       }
//     }

//     console.log('signClient', signClientRef.current)

//     const result = await signClientRef.current?.approve({
//       id: ev.id,
//       namespaces
//     })

//     await result?.acknowledged()

//     sessionsObservable.set(signClientRef.current?.session.getAll() ?? [])

//     // remove any old pairings with same peerMetadata url
//     signClientRef.current?.core.pairing
//       .getPairings()
//       .filter(pairing => ev.params.pairingTopic !== pairing.topic)
//       .forEach(async pairing => {
//         if (ev.params.proposer.metadata.url === pairing.peerMetadata?.url) {
//           await signClientRef.current?.core.pairing.disconnect({
//             topic: pairing.topic
//           })
//         }
//       })
//   }

//   const onSessionRequest = async (ev: SignClientTypes.EventArguments['session_request']) => {
//     console.log('onSessionRequest', ev)
//     // Handle session request logic here
//   }

//   const onSessionPing = async (ev: SignClientTypes.EventArguments['session_ping']) => {
//     console.log('onSessionPing', ev)
//   }

//   const onSessionEvent = async (ev: SignClientTypes.EventArguments['session_event']) => {
//     console.log('onSessionEvent', ev)
//   }

//   const onSessionUpdate = async (ev: SignClientTypes.EventArguments['session_update']) => {
//     console.log('onSessionUpdate', ev)
//   }

//   const onSessionDelete = async (ev: SignClientTypes.EventArguments['session_delete']) => {
//     console.log('onSessionDelete', ev)
//   }

//   return (
//     <WalletConnectContextProvider
//       value={{
//         isReadyObservable,
//         sessionsObservable,
//         connectOptionsObservable,
//         pair,
//         rejectRequest,
//         disconnectSession,
//         disconnectAllSessions
//       }}
//     >
//       {children}
//     </WalletConnectContextProvider>
//   )
// }
