import { Chain } from 'wagmi/chains'
import { Connector } from 'wagmi'
import { getKitConnectWallets } from '@0xsequence/kit'

import {
  apple,
  coinbaseWallet,
  email,
  facebook,
  google,
  metamask,
  sequence,
  twitch,
  walletConnect,
} from './connectors'

interface GetDefaultConnectors {
  chains: Chain[],
  walletConnectProjectId: string,
  defaultChainId?: number
}

export const getDefaultConnectors = ({
  chains,
  walletConnectProjectId,
  defaultChainId,
}: GetDefaultConnectors): Connector<any, any>[] => {
  let defaultChain = chains[0].id
  
  if (defaultChainId) {
    const chain = chains.find(c => c.id === defaultChainId)
    if (chain) {
      defaultChain = chain.id
    }
  }

  const connectors = getKitConnectWallets([
    coinbaseWallet({
      chains,
      options: {
        appName: 'app'
      }
    }),
    email({
      chains,
      options: {
        defaultNetwork: defaultChain
      }
    }),
    google({
      chains,
      options: {
        defaultNetwork: defaultChain
      }
    }),
    facebook({
      chains,
      options: {
        defaultNetwork: defaultChain
      }
    }),
    twitch({
      chains,
      options: {
        defaultNetwork: defaultChain
      }
    }),
    apple({
      chains,
      options: {
        defaultNetwork: defaultChain
      }
    }),
    metamask({
      chains,
    }),
    walletConnect({
      chains,
      options: {
        projectId: walletConnectProjectId
      },
    }),
    sequence({
      chains,
      options: {
        defaultNetwork: defaultChain
      }
    })
  ]) 

  return connectors
}