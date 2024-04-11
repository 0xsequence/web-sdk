import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { useOpenConnectModal } from '@0xsequence/kit'
import { useAccount, useChainId, useDisconnect, useSendTransaction, useWalletClient } from 'wagmi'
import { sequence } from '0xsequence'

function App() {
  const { setOpenConnectModal } = useOpenConnectModal()

  const { disconnect } = useDisconnect()

  const { data: walletClient } = useWalletClient()

  const { address, connector, isConnected } = useAccount()

  const { data: txnData, sendTransaction, isLoading } = useSendTransaction()

  const chainId = useChainId()

  const networkForCurrentChainId = sequence.network.allNetworks.find(n => n.chainId === chainId)

  const runSendTransaction = async () => {
    if (!walletClient) {
      return
    }

    const [account] = await walletClient.getAddresses()

    sendTransaction({ to: account, value: '0', gas: null })
  }

  return (
    <>
      <div>
        <a href="https://vitejs.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React + Sequence Kit with WaaS</h1>
      {!isConnected && (
        <div className="card">
          <button onClick={() => setOpenConnectModal(true)}>Connect</button>
        </div>
      )}

      <div className="card">
        {isConnected && (
          <p>
            Connected to {connector?.name}, wailet address: ({address})
          </p>
        )}
      </div>

      {isConnected && (
        <>
          <div className="card">
            <p>Network: {networkForCurrentChainId?.name}</p>
          </div>
          <div className="card">
            <button onClick={() => runSendTransaction()} disabled={isLoading}>
              Send transaction
            </button>

            {isLoading && <p>Transaction is pending...</p>}

            {txnData && (
              <div>
                <p>Transaction hash: {txnData.hash}</p>

                <a target="_blank" href={`${networkForCurrentChainId?.blockExplorer.rootUrl}/tx/${txnData.hash}`}>
                  View on {networkForCurrentChainId?.name} explorer
                </a>
              </div>
            )}
          </div>

          <div className="card">
            <button onClick={() => disconnect()}>Disconnect</button>
          </div>
        </>
      )}
    </>
  )
}

export default App
