// import { SequenceConnector } from '@0xsequence/wagmi-connector'
import { EthConnectProvider, getEthConnectWallets } from '@ethconnect/core'
import { sequenceWallet, metamaskWallet, injectedWallet } from '@ethconnect/wallets'
import Homepage from './components/Homepage'
import { WagmiConfig, createClient, configureChains } from 'wagmi'
import { publicProvider } from 'wagmi/providers/public'
import { mainnet, polygon } from 'wagmi/chains'

function App() {
  const { chains, provider, webSocketProvider } = configureChains(
    [mainnet, polygon],
    [publicProvider()],
  )

  const connectors = getEthConnectWallets([
    injectedWallet({
      chains
    }),
    sequenceWallet({
      chains,
      connect: {
        app: 'Ethconnect example',
        networkId: 137
      }
    }),
    metamaskWallet({
      chains,
    }),
    // TODO: integrate wallet connect
    // walletConnectWallet({
    //   chains,
    //   options: {
    //     qrcode: true,
    //   },
    // })
  ])

  
  const client = createClient({
    autoConnect: true,
    provider,
    webSocketProvider,
    connectors
  })


  return (
    <WagmiConfig client={client}>
      <EthConnectProvider>
        <Homepage />
      </EthConnectProvider>
    </WagmiConfig>

  );
}

export default App;
