import './App.css'
import { useOpenConnectModal, useWaasFeeOptions } from '@0xsequence/kit'
import {
  useAccount,
  useChainId,
  useDisconnect,
  usePublicClient,
  useSendTransaction,
  useSwitchChain,
  useWalletClient
} from 'wagmi'
import { sequence } from '0xsequence'
import { formatUnits } from 'viem'
import { useEffect, useState } from 'react'

function App() {
  const { setOpenConnectModal } = useOpenConnectModal()
  const { disconnect } = useDisconnect()
  const { data: walletClient } = useWalletClient()
  const { address, isConnected } = useAccount()

  // Switching chain
  const { switchChain } = useSwitchChain()
  const chainId = useChainId()
  const networkForCurrentChainId = sequence.network.allNetworks.find(n => n.chainId === chainId)

  const switchNetwork = () => {
    if (chainId === 421614) {
      switchChain({ chainId: 42170 })
    } else {
      switchChain({ chainId: 421614 })
    }

    setLastTxnDataHash(undefined)
    setMessageSig(undefined)
    setIsMessageValid(undefined)
  }

  // Signing and verifying message
  const messageToSign = 'Two roads diverged in a yellow wood'
  const publicClient = usePublicClient({ chainId })

  const [isSigningMessage, setIsSigningMessage] = useState(false)
  const [messageSig, setMessageSig] = useState<string | undefined>()
  const [isMessageValid, setIsMessageValid] = useState<boolean | undefined>()

  const signMessage = async () => {
    if (!walletClient) {
      return
    }

    setMessageSig(undefined)
    setIsMessageValid(undefined)

    setIsSigningMessage(true)

    try {
      const message = messageToSign

      // sign
      const sig = await walletClient.signMessage({
        account: address || ('' as `0x${string}`),
        message
      })
      console.log('address', address)
      console.log('signature:', sig)
      console.log('chainId in homepage', chainId)

      const [account] = await walletClient.getAddresses()

      const isValid = await publicClient?.verifyMessage({
        address: account,
        message,
        signature: sig
      })

      setIsSigningMessage(false)
      setIsMessageValid(isValid)
      setMessageSig(sig)

      console.log('isValid?', isValid)
    } catch (e) {
      setIsSigningMessage(false)
      console.error(e)
    }
  }

  // Sending txn
  const [lastTxnDataHash, setLastTxnDataHash] = useState<string | undefined>()

  const { data: txnData, sendTransaction, isLoading } = useSendTransaction()
  const runSendTransaction = async () => {
    if (!walletClient) {
      return
    }

    const [account] = await walletClient.getAddresses()

    sendTransaction({ to: account, value: '0', gas: null })
  }

  useEffect(() => {
    if (txnData) {
      setLastTxnDataHash(txnData.hash ?? txnData)
    }
  }, [txnData])

  // Fee options are required when txn is not gas sponsored (not needed on testnets)
  const [pendingFeeOptionConfirmation, confirmPendingFeeOption, rejectPendingFeeOption] = useWaasFeeOptions()

  const [selectedFeeTokenAddress, setSelectedFeeTokenAddress] = useState<string | null | undefined>() // option is null for native token, string for erc20 token
  useEffect(() => {
    if (pendingFeeOptionConfirmation) {
      setSelectedFeeTokenAddress(pendingFeeOptionConfirmation.options[0].token.contractAddress) // preselect first option
    }
  }, [pendingFeeOptionConfirmation])

  const confirmFeeOption = () => {
    if (pendingFeeOptionConfirmation && selectedFeeTokenAddress !== undefined) {
      confirmPendingFeeOption(pendingFeeOptionConfirmation.id, selectedFeeTokenAddress)
    }
  }

  return (
    <div>
      <div className="container">
        <h2 style={{ marginBottom: '10px' }}>Vite + React + Sequence Kit with WaaS</h2>
        {!isConnected && (
          <div className="card" style={{ background: 'transparent' }}>
            <button onClick={() => setOpenConnectModal(true)}>Connect</button>
          </div>
        )}

        {isConnected && (
          <>
            <div className="card">{isConnected && <p>Wallet address: ({address})</p>}</div>

            <div className="card">
              <p>Network: {networkForCurrentChainId?.name}</p>
              <button onClick={() => switchNetwork()} disabled={isLoading}>
                Switch network
              </button>
            </div>
            <div className="card">
              <button onClick={() => runSendTransaction()} disabled={isLoading}>
                Send transaction
              </button>

              {isLoading && <p>Transaction is pending...</p>}

              {lastTxnDataHash && (
                <div>
                  <p style={{ overflowWrap: 'anywhere' }}>Transaction hash: {lastTxnDataHash}</p>

                  <a target="_blank" href={`${networkForCurrentChainId?.blockExplorer.rootUrl}/tx/${lastTxnDataHash}`}>
                    View on {networkForCurrentChainId?.name} explorer
                  </a>
                </div>
              )}

              {pendingFeeOptionConfirmation && (
                <div className="card">
                  <p>Select fee option</p>
                  <select className="fee-option-select" onChange={e => setSelectedFeeTokenAddress(e.target.value)}>
                    {pendingFeeOptionConfirmation.options.map(option => {
                      return (
                        <option key={option.token.contractAddress} value={option.token.contractAddress}>
                          {option.token.name} - {formatUnits(BigInt(option.value), option.token!.decimals!)}
                        </option>
                      )
                    })}
                  </select>

                  <button style={{ display: 'block' }} onClick={() => confirmFeeOption()}>
                    Confirm fee option
                  </button>
                </div>
              )}
            </div>

            <div className="card">
              <p>Sign message</p>
              <p>Message: {messageToSign}</p>
              <button onClick={signMessage} disabled={isLoading}>
                Sign message
              </button>

              {isSigningMessage && <p>Signing message...</p>}

              {messageSig && <p style={{ overflowWrap: 'anywhere' }}>Signature: {messageSig}</p>}

              {isMessageValid && <p>isValid: {isMessageValid.toString()}</p>}
            </div>

            <div className="card" style={{ background: 'transparent' }}>
              <button onClick={() => disconnect()}>Disconnect</button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default App
