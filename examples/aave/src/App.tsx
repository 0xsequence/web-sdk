import './index.css'
import {
  createContractPermission,
  useExplicitSessions,
  useFeeOptions,
  useOpenConnectModal,
  type ExplicitSession
} from '@0xsequence/connect'
import { supplyERC20Calldata, supplyETHCalldata, withdrawERC20Calldata, withdrawETHCalldata } from '@contractjs/aave-v3'
import { useEffect, useState } from 'react'
import { encodeFunctionData, erc20Abi, formatUnits, maxUint256, parseAbi, parseEther, parseUnits } from 'viem'
import { useBalance, useConnection, useDisconnect, useReadContract, useSendTransaction } from 'wagmi'

import { AAVE_V3_POOL_ADDRESS_ARBITRUM, AAVE_V3_WRAPPED_TOKEN_GATEWAY_ADDRESS_ARBITRUM, USDC_ADDRESS_ARBITRUM } from './config'

const AUSDC_ADDRESS = '0x724dc807b04555b71ed48a6896b6F41593b8C637'
const AWETH_ADDRESS = '0xe50fA9b3c56FfB159cB0FCA61F5c9D750e8128c8'
const AUSDC_DECIMALS = 6
const AWETH_DECIMALS = 18
const USDC_DECIMALS = 6
const AUSDC_SYMBOL = 'aUSDC'
const AWETH_SYMBOL = 'aWETH'
const USDC_SYMBOL = 'USDC'

function App() {
  const { setOpenConnectModal } = useOpenConnectModal()

  const { isConnected, address } = useConnection()
  const disconnect = useDisconnect()

  // State for input fields
  const [supplyAmount, setSupplyAmount] = useState('')
  const [supplyNativeAmount, setSupplyNativeAmount] = useState('')
  const [withdrawAmount, setWithdrawAmount] = useState('')
  const [withdrawNativeAmount, setWithdrawNativeAmount] = useState('')
  const [transferNativeAmount, setTransferNativeAmount] = useState('')
  const [recipientAddress, setRecipientAddress] = useState('')
  const [latestTxHash, setLatestTxHash] = useState<string | null>(null)

  // State for session info
  const [sessionsInfo, setSessionsInfo] = useState<ExplicitSession[]>([])
  const walletAddress = address as `0x${string}` | undefined
  const isWalletAddressReady = Boolean(walletAddress)

  // Balance Hooks
  const { data: aUsdcBalance, refetch: refetchAusdcBalance } = useReadContract({
    address: AUSDC_ADDRESS as `0x${string}`,
    abi: erc20Abi,
    functionName: 'balanceOf',
    args: walletAddress ? [walletAddress] : undefined,
    chainId: 42161,
    query: { enabled: isWalletAddressReady }
  })
  const { data: aWethBalance, refetch: refetchAwethBalance } = useReadContract({
    address: AWETH_ADDRESS as `0x${string}`,
    abi: erc20Abi,
    functionName: 'balanceOf',
    args: walletAddress ? [walletAddress] : undefined,
    chainId: 42161,
    query: { enabled: isWalletAddressReady }
  })
  const { data: usdcBalance } = useReadContract({
    address: USDC_ADDRESS_ARBITRUM as `0x${string}`,
    abi: erc20Abi,
    functionName: 'balanceOf',
    args: walletAddress ? [walletAddress] : undefined,
    chainId: 42161,
    query: { enabled: isWalletAddressReady }
  })

  // Session hooks
  const { getExplicitSessions, modifyExplicitSession, addExplicitSession } = useExplicitSessions()

  // Transaction Hooks
  const {
    data: dataSupply,
    sendTransaction: sendSupplyTransaction,
    isPending: isPendingSupply,
    error: errorSupply
  } = useSendTransaction()
  const {
    data: dataSupplyNative,
    sendTransaction: sendSupplyNativeTransaction,
    isPending: isPendingSupplyNative,
    error: errorSupplyNative
  } = useSendTransaction()
  const {
    data: dataWithdraw,
    sendTransaction: sendWithdrawTransaction,
    isPending: isPendingWithdraw,
    error: errorWithdraw
  } = useSendTransaction()
  const {
    data: dataWithdrawNative,
    sendTransaction: sendWithdrawNativeTransaction,
    isPending: isPendingWithdrawNative,
    error: errorWithdrawNative
  } = useSendTransaction()
  const {
    data: dataNativeCurrency,
    sendTransaction: sendNativeCurrencyTransaction,
    isPending: isPendingNativeCurrency,
    error: errorNativeCurrency
  } = useSendTransaction()
  const {
    data: dataApproveAWETH,
    sendTransaction: sendApproveAWETHTransaction,
    isPending: isPendingApproveAWETH,
    error: errorApproveAWETH
  } = useSendTransaction()
  const {
    data: dataExplicitEmit,
    sendTransaction: sendExplicitEmitTransaction,
    isPending: isPendingExplicitEmit,
    error: errorExplicitEmit
  } = useSendTransaction()
  const {
    data: dataApproveUSDC,
    sendTransaction: sendApproveUSDCTransaction,
    isPending: isPendingApproveUSDC,
    error: errorApproveUSDC
  } = useSendTransaction()
  const {
    data: dataCallTestContract,
    sendTransaction: sendCallTestContract,
    isPending: isPendingCallTestContract,
    error: errorCallTestContract
  } = useSendTransaction()

  // Fee Option Hook
  const [pendingFeeOptionConfirmation, confirmPendingFeeOption] = useFeeOptions()

  // Native Balance Hook
  const { data: nativeBalanceData } = useBalance({ address, chainId: 42161 })

  // Effect to update the latest transaction hash for display
  useEffect(() => {
    const latestData =
      dataSupply ||
      dataSupplyNative ||
      dataWithdraw ||
      dataWithdrawNative ||
      dataNativeCurrency ||
      dataApproveAWETH ||
      dataExplicitEmit ||
      dataApproveUSDC ||
      dataCallTestContract
    if (latestData) {
      setLatestTxHash(latestData)
      // Refetch balances after a successful transaction
      refetchAusdcBalance()
      refetchAwethBalance()
    }
  }, [
    dataSupply,
    dataSupplyNative,
    dataWithdraw,
    dataWithdrawNative,
    dataNativeCurrency,
    dataApproveAWETH,
    dataExplicitEmit,
    dataApproveUSDC,
    dataCallTestContract,
    refetchAusdcBalance,
    refetchAwethBalance
  ])

  useEffect(() => {
    getExplicitSessions().then(sessions => {
      setSessionsInfo(sessions)
    })
  }, [getExplicitSessions])

  const anyError =
    errorSupply ||
    errorSupplyNative ||
    errorWithdraw ||
    errorWithdrawNative ||
    errorNativeCurrency ||
    errorApproveAWETH ||
    errorExplicitEmit ||
    errorApproveUSDC ||
    errorCallTestContract

  const handleConnect = () => setOpenConnectModal(true)
  const handleDisconnect = () => disconnect.mutate()

  const handleSupply = (isNative: boolean = false) => {
    if (isNative) {
      if (!supplyNativeAmount || isNaN(Number(supplyNativeAmount))) {
        return
      }
      sendSupplyNativeTransaction({
        to: AAVE_V3_WRAPPED_TOKEN_GATEWAY_ADDRESS_ARBITRUM,
        data: supplyETHCalldata(AAVE_V3_POOL_ADDRESS_ARBITRUM, address as `0x${string}`, 0),
        value: parseEther(supplyNativeAmount)
      })
    } else {
      if (!supplyAmount || isNaN(Number(supplyAmount))) {
        return
      }
      const amountAsBigInt = parseUnits(supplyAmount, 6)
      sendSupplyTransaction({
        to: AAVE_V3_POOL_ADDRESS_ARBITRUM,
        data: supplyERC20Calldata(USDC_ADDRESS_ARBITRUM, amountAsBigInt, address as `0x${string}`, 0)
      })
    }
  }

  const handleWithdraw = (isNative: boolean = false) => {
    if (isNative) {
      if (!withdrawNativeAmount || isNaN(Number(withdrawNativeAmount))) {
        return
      }
      sendWithdrawNativeTransaction({
        to: AAVE_V3_WRAPPED_TOKEN_GATEWAY_ADDRESS_ARBITRUM,
        data: withdrawETHCalldata(AAVE_V3_POOL_ADDRESS_ARBITRUM, parseEther(withdrawNativeAmount), address as `0x${string}`)
      })
    } else {
      if (!withdrawAmount || isNaN(Number(withdrawAmount))) {
        return
      }
      const amountAsBigInt = parseUnits(withdrawAmount, 6)
      sendWithdrawTransaction({
        to: AAVE_V3_POOL_ADDRESS_ARBITRUM,
        data: withdrawERC20Calldata(USDC_ADDRESS_ARBITRUM, amountAsBigInt, address as `0x${string}`)
      })
    }
  }

  const handleTransferNative = () => {
    if (!transferNativeAmount || isNaN(Number(transferNativeAmount)) || !recipientAddress) {
      return
    }
    sendNativeCurrencyTransaction({
      to: recipientAddress as `0x${string}`,
      value: parseUnits(transferNativeAmount, 18)
    })
  }

  const handleExplicitEmit = () => {
    sendExplicitEmitTransaction({
      to: '0x33985d320809E26274a72E03268c8a29927Bc6dA',
      data: encodeFunctionData({ abi: parseAbi(['function explicitEmit()']), functionName: 'explicitEmit', args: [] })
    })
  }

  const handleApproveAWETH = () => {
    sendApproveAWETHTransaction({
      to: AWETH_ADDRESS,
      data: encodeFunctionData({
        abi: parseAbi(['function approve(address spender, uint256 amount)']),
        functionName: 'approve',
        args: [AAVE_V3_WRAPPED_TOKEN_GATEWAY_ADDRESS_ARBITRUM, maxUint256]
      })
    })
  }

  const handleApproveUSDC = () => {
    sendApproveUSDCTransaction({
      to: USDC_ADDRESS_ARBITRUM,
      data: encodeFunctionData({
        abi: parseAbi(['function approve(address spender, uint256 amount)']),
        functionName: 'approve',
        args: [AAVE_V3_POOL_ADDRESS_ARBITRUM, maxUint256]
      })
    })
  }

  const handleModifySession = () => {
    const newPermission = createContractPermission({
      address: '0x7E485D0DA0392a0273E7e599c0fc066739E0Fe89',
      functionSignature: 'function testContract() public'
    })
    const currentSession = sessionsInfo[0] as ExplicitSession
    const modifiedSession = { ...currentSession, permissions: [...currentSession.permissions!, newPermission] }
    modifyExplicitSession(modifiedSession)
  }

  const handleCallNewAllowedContract = () => {
    sendCallTestContract({
      to: '0x7E485D0DA0392a0273E7e599c0fc066739E0Fe89',
      data: encodeFunctionData({
        abi: parseAbi(['function testContract() public']),
        functionName: 'testContract'
      })
    })
  }

  const handleAddExplicitSession = () => {
    const newSession = {
      chainId: 42161,
      nativeTokenSpending: {
        valueLimit: parseEther('0.1')
      },
      expiresIn: {
        days: 1
      },
      permissions: [
        createContractPermission({
          address: USDC_ADDRESS_ARBITRUM,
          functionSignature: 'function burn(uint256 amount) public'
        })
      ]
    }
    addExplicitSession(newSession)
  }

  return (
    <div className="app-container">
      <div className="main-container">
        <main className="main-content">
          <section className="card">
            <h2 className="card-title">Wallet Connection</h2>
            <div className="wallet-connection-row">
              <div className="wallet-status">
                <div className={`status-dot ${isConnected ? 'connected' : 'disconnected'}`} />
                <span>{isConnected ? 'Connected' : 'Disconnected'}</span>
              </div>
              {isConnected ? (
                <button onClick={handleDisconnect} className="btn btn-danger" aria-label="Disconnect wallet">
                  Disconnect
                </button>
              ) : (
                <button onClick={handleConnect} className="btn btn-primary" aria-label="Connect wallet">
                  Connect Wallet
                </button>
              )}
            </div>
            {isConnected && address && (
              <div className="address-display">
                <p>Connected Address:</p>
                <p className="address-mono">{address}</p>
              </div>
            )}
            {isConnected && nativeBalanceData && (
              <div className="address-display">
                <div className="flex flex-col gap-2">
                  {' '}
                  <p>Native Balance:</p>
                  <p className="address-mono">{formatUnits(nativeBalanceData.value, nativeBalanceData.decimals)}</p>
                </div>

                <div className="flex flex-col gap-2 mt-2">
                  <p>USDC Balance:</p>
                  <p className="address-mono">
                    {usdcBalance ? `${parseFloat(formatUnits(usdcBalance, USDC_DECIMALS)).toFixed(5)} ${USDC_SYMBOL}` : '0.00'}
                  </p>
                </div>
              </div>
            )}
          </section>

          {isConnected && (
            <>
              <h2 className="section-title">AAVE Pools</h2>
              <section className="card">
                <div className="pool-container">
                  <div className="pool-info">
                    <div className="pool-logo">
                      <img src="https://seeklogo.com/images/U/usd-coin-usdc-logo-CB4C5B1C51-seeklogo.com.png" alt="USDC Logo" />
                      <img
                        src="https://s2.coinmarketcap.com/static/img/coins/64x64/11841.png"
                        alt="Arbitrum Network"
                        className="network-icon"
                      />
                    </div>
                    <div className="pool-text-info">
                      <h3 className="pool-title">USDC</h3>
                      <p className="pool-apy">APY 4.68%</p>
                      <p className="pool-balance">
                        Pool Balance:{' '}
                        {aUsdcBalance
                          ? `${parseFloat(formatUnits(aUsdcBalance, AUSDC_DECIMALS)).toFixed(5)} ${AUSDC_SYMBOL}`
                          : '0.00'}
                      </p>
                    </div>
                  </div>
                  <div className="pool-actions">
                    <div className="action-group">
                      <input
                        type="number"
                        disabled={isPendingSupply}
                        value={supplyAmount}
                        onChange={e => setSupplyAmount(e.target.value)}
                        placeholder="0.0"
                        className="input-field"
                        aria-label="Supply amount"
                      />
                      <button onClick={() => handleSupply(false)} disabled={isPendingSupply} className="btn btn-supply">
                        {isPendingSupply ? 'Supplying...' : 'Supply'}
                      </button>
                    </div>
                    <div className="action-group">
                      <input
                        type="number"
                        disabled={isPendingWithdraw}
                        value={withdrawAmount}
                        onChange={e => setWithdrawAmount(e.target.value)}
                        placeholder="0.0"
                        className="input-field"
                        aria-label="Withdraw amount"
                      />
                      <button onClick={() => handleWithdraw(false)} disabled={isPendingWithdraw} className="btn btn-withdraw">
                        {isPendingWithdraw ? 'Withdrawing...' : 'Withdraw'}
                      </button>
                    </div>
                  </div>
                </div>
              </section>
              <section className="card">
                <div className="pool-container">
                  <div className="pool-info">
                    <div className="pool-logo">
                      <img src="https://s2.coinmarketcap.com/static/img/coins/64x64/1027.png" alt="ETH Logo" />
                      <img
                        src="https://s2.coinmarketcap.com/static/img/coins/64x64/11841.png"
                        alt="Arbitrum Network"
                        className="network-icon"
                      />
                    </div>
                    <div className="pool-text-info">
                      <h3 className="pool-title">ETH</h3>
                      <p className="pool-apy">APY 1.68%</p>
                      <p className="pool-balance">
                        Pool Balance:{' '}
                        {aWethBalance
                          ? `${parseFloat(formatUnits(aWethBalance, AWETH_DECIMALS)).toFixed(5)} ${AWETH_SYMBOL}`
                          : '0.00'}
                      </p>
                    </div>
                  </div>
                  <div className="pool-actions">
                    <div className="action-group">
                      <input
                        type="number"
                        value={supplyNativeAmount}
                        disabled={isPendingSupplyNative}
                        onChange={e => setSupplyNativeAmount(e.target.value)}
                        placeholder="0.0"
                        className="input-field"
                        aria-label="Supply amount"
                      />
                      <button onClick={() => handleSupply(true)} disabled={isPendingSupplyNative} className="btn btn-supply">
                        {isPendingSupplyNative ? 'Supplying...' : 'Supply'}
                      </button>
                    </div>
                    <div className="action-group">
                      <input
                        type="number"
                        disabled={isPendingWithdrawNative}
                        value={withdrawNativeAmount}
                        onChange={e => setWithdrawNativeAmount(e.target.value)}
                        placeholder="0.0"
                        className="input-field"
                        aria-label="Withdraw amount"
                      />
                      <button
                        onClick={() => handleWithdraw(true)}
                        disabled={isPendingWithdrawNative}
                        className="btn btn-withdraw"
                      >
                        {isPendingWithdrawNative ? 'Withdrawing...' : 'Withdraw'}
                      </button>
                    </div>
                  </div>
                </div>
              </section>
            </>
          )}

          {isConnected && (
            <>
              <h2 className="section-title">Extra Test Actions</h2>
              <section className="card">
                <div className="extra-test-actions-grid">
                  <div className="action-item">
                    <h3>Transfer Native Currency</h3>
                    <p>Send ETH to a specified address.</p>
                    <div className="action-item-inputs">
                      <input
                        type="number"
                        value={transferNativeAmount}
                        onChange={e => setTransferNativeAmount(e.target.value)}
                        placeholder="0.0"
                        className="input-field"
                        aria-label="Transfer native amount"
                      />
                      <input
                        type="text"
                        value={recipientAddress}
                        onChange={e => setRecipientAddress(e.target.value)}
                        placeholder="Recipient address 0x..."
                        className="input-field"
                        aria-label="Recipient address"
                      />
                    </div>
                    <button onClick={handleTransferNative} disabled={isPendingNativeCurrency} className="btn btn-secondary">
                      {isPendingNativeCurrency ? 'Transferring...' : 'Send ETH'}
                    </button>
                  </div>
                  <div className="action-item">
                    <h3>Explicit Emit</h3>
                    <p>Call a test contract function to emit an event.</p>
                    <button onClick={handleExplicitEmit} disabled={isPendingExplicitEmit} className="btn btn-secondary">
                      {isPendingExplicitEmit ? 'Emitting...' : 'Emit Event'}
                    </button>
                  </div>
                  <div className="action-item">
                    <h3>Approve USDC</h3>
                    <p>Approve USDC to AAVE V3 Pool.</p>
                    <button onClick={handleApproveUSDC} disabled={isPendingApproveUSDC} className="btn btn-secondary">
                      {isPendingApproveUSDC ? 'Approving...' : 'Approve USDC'}
                    </button>
                  </div>
                  <div className="action-item">
                    <h3>Approve aWETH</h3>
                    <p>Approve aWETH to be spent by the AAVE V3 Gateway.</p>
                    <button onClick={handleApproveAWETH} disabled={isPendingApproveAWETH} className="btn btn-secondary">
                      {isPendingApproveAWETH ? 'Approving...' : 'Approve aWETH'}
                    </button>
                  </div>
                  <div className="action-item">
                    <h3>Get session info</h3>
                    <button onClick={async () => console.log(await getExplicitSessions())} className="btn btn-secondary">
                      'Get session info'
                    </button>
                  </div>
                  <div className="action-item">
                    <h3>Call new allowed contract</h3>
                    <button onClick={handleCallNewAllowedContract} className="btn btn-secondary">
                      {isPendingCallTestContract ? 'Calling...' : 'Call new allowed contract (Can be called only once)'}
                    </button>
                  </div>
                  <div className="action-item">
                    <h3>Modify session</h3>
                    <button onClick={handleModifySession} className="btn btn-secondary">
                      Modify session (Add new allowed contract)
                    </button>
                  </div>
                </div>
                <div className="action-item">
                  <h3>Add new explicit session</h3>
                  <button onClick={handleAddExplicitSession} className="btn btn-secondary">
                    Add new explicit session
                  </button>
                </div>
              </section>
            </>
          )}

          {(latestTxHash || anyError) && (
            <section className="card">
              <h2 className="card-title">Last Transaction Status</h2>
              {anyError && (
                <div className="status-box status-error">
                  <h3>Transaction Error</h3>
                  <p>{anyError.message}</p>
                </div>
              )}
              {latestTxHash && (
                <div className="status-box status-success">
                  <h3>Transaction Successful</h3>
                  <p>Transaction Hash:</p>
                  <p className="address-mono">{latestTxHash}</p>
                </div>
              )}
            </section>
          )}
        </main>
      </div>

      {pendingFeeOptionConfirmation && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2 className="card-title">Choose Fee Token</h2>
            <p>Select a token to pay for this transaction's gas fees.</p>
            <div className="fee-options-list">
              {pendingFeeOptionConfirmation.options.map(option => (
                <button
                  key={option.token.contractAddress}
                  onClick={() =>
                    confirmPendingFeeOption(pendingFeeOptionConfirmation.id, option.token.contractAddress as `0x${string}`)
                  }
                  className="fee-option-btn"
                >
                  <img src={option.token.logoURL} alt={option.token.name} />
                  <div>
                    <p className="fee-token-name">{option.token.name}</p>
                    <p className="fee-token-amount">{formatUnits(BigInt(option.value), option.token.decimals || 18)}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default App
