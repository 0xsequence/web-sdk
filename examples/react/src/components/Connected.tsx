import {
  signEthAuthProof,
  useExplicitSessions,
  useFeeOptions,
  useHasPermission,
  useOpenConnectModal,
  useSendWalletTransaction,
  useSequenceSessionState,
  useStorage,
  useWallets,
  validateEthProof
} from '@0xsequence/connect'
import { Button, Card, Divider, Text } from '@0xsequence/design-system'
import { allNetworks, ChainId } from '@0xsequence/network'
import { useOpenWalletModal } from '@0xsequence/wallet-widget'
import { Alert, CardButton, Header, WalletListItem, type AlertProps } from 'example-shared-components'
import { AbiFunction } from 'ox'
import React, { useEffect } from 'react'
import { createPublicClient, encodeFunctionData, formatUnits, http, zeroAddress, type TransactionRequest } from 'viem'
import { polygon } from 'viem/chains'
import { createSiweMessage, generateSiweNonce } from 'viem/siwe'
import { useChainId, useConnection, usePublicClient, useSendTransaction, useWalletClient } from 'wagmi'

import { messageToSign } from '../constants'
import { abi } from '../constants/nft-abi'
import {
  EMITTER_ABI,
  getEmitterContractAddress,
  getSessionConfigForType,
  PermissionsType,
  USDC_ADDRESS
} from '../constants/permissions'

import { Select } from './Select'

export const Connected = () => {
  const { setOpenConnectModal } = useOpenConnectModal()
  const { address } = useConnection()

  const { setOpenWalletModal } = useOpenWalletModal()

  const { data: walletClient } = useWalletClient()
  const storage = useStorage()

  const { wallets, setActiveWallet, disconnectWallet } = useWallets()

  useEffect(() => {
    console.log('wallets changed', wallets, Date.now())
  }, [wallets])

  const isV3WalletConnectionActive = wallets.some(w => w.id === 'sequence-v3-wallet' && w.isActive)

  const sessionState = useSequenceSessionState()

  const [hasPermission, setHasPermission] = React.useState(false)

  // console.log('sessionState', sessionState)

  const {
    data: implicitTestTxnData,
    sendTransaction: sendImplicitTestTransaction,
    isPending: isPendingImplicitTestTxn,
    error: sendImplicitTestTransactionError,
    reset: resetImplicitTestTransaction
  } = useSendTransaction()
  const {
    data: mintTxnData,
    sendTransaction: sendMintWalletTransaction,
    isLoading: isPendingMintTxn,
    error: mintTxnError,
    reset: resetMintWalletTransaction
  } = useSendWalletTransaction()
  const {
    data: txnData3,
    sendTransaction: sendUnsponsoredTransaction,
    isPending: isPendingSendUnsponsoredTxn,
    error: sendUnsponsoredTransactionError,
    reset: resetSendUnsponsoredTransaction
  } = useSendTransaction()

  const {
    data: permissionedTxnData,
    sendTransaction: sendPermissionedTransaction,
    isPending: isPendingPermissionedTxn,
    error: permissionedTxnError,
    reset: resetPermissionedTxn
  } = useSendTransaction()

  const {
    data: walletTxnData,
    sendTransaction: sendWalletTransaction,
    isLoading: isPendingWalletTransaction,
    error: sendWalletTransactionError,
    reset: resetWalletTransaction
  } = useSendWalletTransaction()

  const [isSigningMessage, setIsSigningMessage] = React.useState(false)
  const [isMessageValid, setIsMessageValid] = React.useState<boolean | undefined>()
  const [messageSig, setMessageSig] = React.useState<string | undefined>()
  const [isSigningSIWE, setIsSigningSIWE] = React.useState(false)
  const [siweSig, setSiweSig] = React.useState<string | undefined>()
  const [isSIWEValid, setIsSIWEValid] = React.useState<boolean | undefined>()
  const [isSigningTypedData, setIsSigningTypedData] = React.useState(false)
  const [typedDataSig, setTypedDataSig] = React.useState<string | undefined>()
  const [isTypedDataValid, setIsTypedDataValid] = React.useState<boolean | undefined>()

  const [lastImplicitTestTxnDataHash, setLastImplicitTestTxnDataHash] = React.useState<string | undefined>()
  const [lastTxnDataHash2, setLastTxnDataHash2] = React.useState<string | undefined>()
  const [lastTxnDataHash3, setLastTxnDataHash3] = React.useState<string | undefined>()
  const [lastPermissionedTxnDataHash, setLastPermissionedTxnDataHash] = React.useState<string | undefined>()
  const [lastWalletTxnDataHash, setLastWalletTxnDataHash] = React.useState<string | undefined>()

  const chainId = useChainId()
  const [pendingFeeOptionConfirmation, confirmPendingFeeOption] = useFeeOptions()

  const [selectedFeeOptionTokenName, setSelectedFeeOptionTokenName] = React.useState<string | undefined>()

  const { addExplicitSession, isLoading: isAddingExplicitSession, error: addExplicitSessionError } = useExplicitSessions()
  const [permissionType, setPermissionType] = React.useState<PermissionsType>('contractCall')
  const { checkPermission, isLoading: isCheckingPermission, error: checkPermissionError } = useHasPermission()

  const [hasImplicitSession, setHasImplicitSession] = React.useState(false)

  useEffect(() => {
    const checkPermissions = async () => {
      if (!sessionState.isInitialized || !isV3WalletConnectionActive || !address || !chainId) {
        setHasPermission(false)
        return
      }

      setHasImplicitSession(sessionState.sessions.some(s => s.type === 'implicit'))

      try {
        if (permissionType === 'none') {
          setHasPermission(true)
          return
        }

        const emitterTxData = encodeFunctionData({
          abi: [
            {
              type: 'function',
              name: 'explicitEmit',
              stateMutability: 'nonpayable',
              inputs: [],
              outputs: []
            }
          ],
          functionName: 'explicitEmit'
        })

        const txs: TransactionRequest[] = []

        if (permissionType === 'contractCall' || permissionType === 'combined') {
          txs.push({
            to: getEmitterContractAddress(window.location.origin) as `0x${string}`,
            data: emitterTxData
          })
        }

        if (permissionType === 'usdcTransfer' || permissionType === 'combined') {
          if (chainId !== ChainId.OPTIMISM) {
            setHasPermission(false)
            return
          }
          const usdcTransferData = encodeFunctionData({
            abi: [
              {
                type: 'function',
                name: 'transfer',
                stateMutability: 'nonpayable',
                inputs: [
                  { name: 'to', type: 'address' },
                  { name: 'value', type: 'uint256' }
                ],
                outputs: [{ name: '', type: 'bool' }]
              }
            ],
            functionName: 'transfer',
            args: [address, 1n]
          })
          txs.push({
            to: USDC_ADDRESS as `0x${string}`,
            data: usdcTransferData
          })
        }

        if (txs.length === 0) {
          setHasPermission(false)
          return
        }

        const allowed = await checkPermission({ chainId, transactions: txs })
        setHasPermission(allowed)
      } catch (error) {
        console.error('Failed to check permissions:', error)
        setHasPermission(false)
      }
    }

    checkPermissions()
  }, [sessionState, address, chainId, permissionType, isV3WalletConnectionActive, checkPermission])

  useEffect(() => {
    if (pendingFeeOptionConfirmation) {
      setSelectedFeeOptionTokenName(pendingFeeOptionConfirmation.options[0].token.name)
    }
  }, [pendingFeeOptionConfirmation])

  useEffect(() => {
    if (!sendImplicitTestTransactionError) {
      return
    }

    if (sendImplicitTestTransactionError instanceof Error) {
      console.error(sendImplicitTestTransactionError.cause)
    } else {
      console.error(sendImplicitTestTransactionError)
    }
  }, [sendImplicitTestTransactionError])

  useEffect(() => {
    if (!sendUnsponsoredTransactionError) {
      return
    }

    if (sendUnsponsoredTransactionError instanceof Error) {
      console.error(sendUnsponsoredTransactionError.cause)
    } else {
      console.error(sendUnsponsoredTransactionError)
    }
  }, [sendUnsponsoredTransactionError])

  useEffect(() => {
    if (!mintTxnError) {
      return
    }

    if (mintTxnError instanceof Error) {
      console.error(mintTxnError.cause)
    } else {
      console.error(mintTxnError)
    }
  }, [mintTxnError])

  const [feeOptionAlert, setFeeOptionAlert] = React.useState<AlertProps | undefined>(undefined)

  const networkForCurrentChainId = allNetworks.find(n => n.chainId === chainId)!

  const publicClient = usePublicClient({ chainId })

  const generateEthAuthProof = async () => {
    if (!walletClient || !publicClient || !storage) {
      return
    }

    try {
      // @ts-ignore
      const proof = await signEthAuthProof(walletClient, storage)
      console.log('proof:', proof)

      // @ts-ignore
      const isValidOnCurrentChain = await validateEthProof(walletClient, publicClient, proof)

      if (isValidOnCurrentChain) {
        console.log('[ETHAuth validate] success chain:', chainId)
        console.log('isValid?: true (current chain)', { chainId })
        return
      }

      if (chainId === polygon.id) {
        console.log('isValid?: false', { attemptedChains: [chainId] })
        return
      }

      const polygonClient = createPublicClient({
        chain: polygon,
        transport: http(polygon.rpcUrls.default.http[0] ?? 'https://polygon-rpc.com')
      })

      // @ts-ignore
      const isValidOnPolygon = await validateEthProof(walletClient, polygonClient, proof)
      if (isValidOnPolygon) {
        console.log('[ETHAuth validate] success chain:', polygon.id)
      }
      console.log('isValid?:', isValidOnPolygon, { attemptedChains: [chainId, polygon.id] })
    } catch (e) {
      console.error(e)
    }
  }

  useEffect(() => {
    if (implicitTestTxnData) {
      setLastImplicitTestTxnDataHash((implicitTestTxnData as any).hash ?? implicitTestTxnData)
    }
    if (mintTxnData) {
      setLastTxnDataHash2((mintTxnData as any).hash ?? mintTxnData)
    }
    if (txnData3) {
      setLastTxnDataHash3((txnData3 as any).hash ?? txnData3)
    }
    if (permissionedTxnData) {
      setLastPermissionedTxnDataHash((permissionedTxnData as any).hash ?? permissionedTxnData)
    }
    if (walletTxnData) {
      setLastWalletTxnDataHash(walletTxnData)
    }
  }, [implicitTestTxnData, mintTxnData, txnData3, permissionedTxnData, walletTxnData])

  const domain = {
    name: 'Sequence Example',
    version: '1',
    chainId: chainId,
    verifyingContract: '0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC'
  } as const

  const types = {
    Person: [
      { name: 'name', type: 'string' },
      { name: 'wallet', type: 'address' }
    ]
  } as const

  const value = {
    name: 'John Doe',
    wallet: '0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC'
  } as const

  const signMessage = async () => {
    if (!walletClient || !publicClient) {
      return
    }

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

      const isValid = await publicClient.verifyMessage({
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
      if (e instanceof Error) {
        console.error(e.cause)
      } else {
        console.error(e)
      }
    }
  }

  const signSIWE = async () => {
    if (!walletClient || !publicClient) {
      return
    }

    setIsSigningSIWE(true)

    try {
      const message = createSiweMessage({
        address: address || ('' as `0x${string}`),
        chainId: chainId,
        domain: window.location.hostname,
        nonce: generateSiweNonce(),
        statement: messageToSign,
        uri: window.location.origin,
        version: '1'
      })

      const sig = await walletClient.signMessage({
        account: address || ('' as `0x${string}`),
        message
      })

      console.log('address', address)
      console.log('signature', sig)
      console.log('chainId in homepage', chainId)

      const isValid = await publicClient.verifyMessage({
        address: address || ('' as `0x${string}`),
        message,
        signature: sig
      })

      setSiweSig(sig)
      setIsSIWEValid(isValid)
      setIsSigningSIWE(false)
    } catch (e) {
      setIsSigningSIWE(false)
      if (e instanceof Error) {
        console.error(e.cause)
      }
    }
  }

  const signTypedData = async () => {
    if (!walletClient || !address || !publicClient) {
      return
    }

    setIsSigningTypedData(true)

    try {
      const sig = await walletClient.signTypedData({
        account: address,
        domain,
        types,
        primaryType: 'Person',
        message: value
      })

      console.log('signature:', sig)

      const [account] = await walletClient.getAddresses()

      const isValid = await publicClient.verifyTypedData({
        address: account,
        domain,
        types,
        primaryType: 'Person',
        message: value,
        signature: sig
      })

      console.log('isValid?', isValid)

      setTypedDataSig(sig)
      setIsTypedDataValid(isValid)
      setIsSigningTypedData(false)
    } catch (e) {
      setIsSigningTypedData(false)
      if (e instanceof Error) {
        console.error(e.cause)
      } else {
        console.error(e)
      }
    }
  }

  const runSendV3ImplicitTestTransaction = async () => {
    if (!walletClient) {
      return
    }

    sendImplicitTestTransaction({
      to: getEmitterContractAddress(window.location.origin),
      value: 0n,
      data: AbiFunction.getSelector(EMITTER_ABI[1])
    })
  }

  const handleAddPermissions = async () => {
    try {
      const session = getSessionConfigForType(window.location.origin, chainId, permissionType)
      if (session) {
        await addExplicitSession(session, true)
        alert('Permission added successfully!')
      } else {
        alert('No permissions to request for the selected type.')
      }
    } catch (e) {
      console.error('Failed to add permissions:', e)
      alert('Failed to add permissions.')
    }
  }

  const runSendConditionallyAllowedV3Transaction = async () => {
    if (!walletClient) {
      return
    }
    sendPermissionedTransaction({
      to: getEmitterContractAddress(window.location.origin),
      data: AbiFunction.getSelector(EMITTER_ABI[0])
    })
  }

  const runSendWalletTransaction = async () => {
    if (!walletClient) {
      return
    }
    sendWalletTransaction({
      chainId,
      transaction: {
        to: getEmitterContractAddress(window.location.origin),
        data: AbiFunction.getSelector(EMITTER_ABI[0])
      }
    })
  }

  const runSendUnsponsoredTransaction = async () => {
    if (!walletClient) {
      return
    }

    const [account] = await walletClient.getAddresses()

    sendUnsponsoredTransaction({ to: account, value: BigInt(0), gas: null })
  }

  const runMintNFT = async () => {
    if (!address) {
      return
    }

    const data = encodeFunctionData({
      abi,
      functionName: 'awardItem',
      args: [address, 'https://dev-metadata.sequence.app/projects/277/collections/62/tokens/0.json']
    })

    sendMintWalletTransaction({
      chainId,
      transaction: {
        to: '0x0d402C63cAe0200F0723B3e6fa0914627a48462E',
        data
      }
    })
  }

  const onClickConnect = () => {
    setOpenConnectModal(true)
  }

  useEffect(() => {
    setLastImplicitTestTxnDataHash(undefined)
    setLastTxnDataHash2(undefined)
    setLastTxnDataHash3(undefined)
    setLastPermissionedTxnDataHash(undefined)
    setLastWalletTxnDataHash(undefined)
    setIsMessageValid(undefined)
    setTypedDataSig(undefined)
    resetMintWalletTransaction()
    resetSendUnsponsoredTransaction()
    resetImplicitTestTransaction()
    resetPermissionedTxn()
    resetWalletTransaction()
  }, [chainId, address])

  return (
    <>
      <Header />
      <div className="flex px-4 flex-col justify-center items-center" style={{ margin: '140px 0' }}>
        <div className="flex flex-col gap-4 max-w-[480px]">
          <div className="flex flex-col gap-2">
            <div className="flex my-3 flex-col gap-2">
              <Text variant="medium" color="muted">
                Connected Wallets
              </Text>
              <div className="flex flex-col gap-2 p-2">
                {[...wallets]
                  .sort((a, b) => {
                    // Sort embedded wallet to the top
                    if (a.isEmbedded && !b.isEmbedded) {
                      return -1
                    }
                    if (!a.isEmbedded && b.isEmbedded) {
                      return 1
                    }
                    return 0
                  })
                  .map(wallet => (
                    <WalletListItem
                      key={wallet.id}
                      id={wallet.id}
                      name={wallet.name}
                      address={wallet.address}
                      isActive={wallet.isActive}
                      isEmbedded={wallet.isEmbedded}
                      onSelect={() => setActiveWallet(wallet.address)}
                      onDisconnect={() => disconnectWallet(wallet.address)}
                    />
                  ))}
              </div>
            </div>

            <div className="flex gap-2 flex-row items-center justify-center">
              <Button shape="square" onClick={onClickConnect} variant="feature" size="sm" label="Connect another wallet" />
            </div>

            <Text className="align-self-center mt-4" variant="medium" color="muted">
              Demos
            </Text>

            <Text variant="small-bold" color="muted">
              Wallet Widget
            </Text>

            <CardButton
              title="Wallet widget"
              description="View your integrated wallet"
              onClick={() => setOpenWalletModal(true)}
            />

            <CardButton
              title="Wallet Widget Inventory"
              description="Open the wallet widget with a specific collection (location: search for this demo)"
              onClick={() =>
                setOpenWalletModal(true, {
                  defaultNavigation: {
                    location: 'search'
                  }
                })
              }
            />

            <Text className="mt-4" variant="small-bold" color="muted">
              Send Transactions
            </Text>

            {!networkForCurrentChainId.testnet && !isV3WalletConnectionActive && (
              <CardButton
                title="Send unsponsored transaction"
                description="Send an unsponsored transaction with your wallet"
                isPending={isPendingSendUnsponsoredTxn}
                onClick={runSendUnsponsoredTransaction}
              />
            )}
            {networkForCurrentChainId.blockExplorer &&
              lastTxnDataHash3 &&
              ((txnData3 as any)?.chainId === chainId || txnData3) && (
                <Text className="ml-4" variant="small" underline color="primary" asChild>
                  <a
                    href={`${networkForCurrentChainId.blockExplorer.rootUrl}/tx/${(txnData3 as any).hash ?? txnData3}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    View on {networkForCurrentChainId.blockExplorer.name}
                  </a>
                </Text>
              )}

            {hasImplicitSession && (
              <>
                <Text className="mt-4" variant="small-bold" color="muted">
                  with Implicit permission
                </Text>

                <CardButton
                  title="Send conditionally allowed transaction"
                  description="Calls implicitEmit() on test contract."
                  isPending={isPendingImplicitTestTxn}
                  onClick={runSendV3ImplicitTestTransaction}
                />
                {networkForCurrentChainId.blockExplorer && lastImplicitTestTxnDataHash && (
                  <Text className="ml-4" variant="small" underline color="primary" asChild>
                    <a
                      href={`${networkForCurrentChainId.blockExplorer.rootUrl}/tx/${lastImplicitTestTxnDataHash}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      View implicit test transaction result on {networkForCurrentChainId.blockExplorer.name}
                    </a>
                  </Text>
                )}
              </>
            )}

            <Divider />

            {isV3WalletConnectionActive && (
              <>
                <Text variant="small-bold" className="mt-4" color="muted">
                  with Explicit permission
                </Text>

                <div className="mb-2">
                  <Select
                    name="permissionType"
                    label="Pick a permission type"
                    onValueChange={val => setPermissionType(val as PermissionsType)}
                    value={permissionType}
                    options={[
                      { label: 'Contract call (explicitEmit)', value: 'contractCall' },
                      { label: 'USDC Transfer (Optimism only)', value: 'usdcTransfer' },
                      { label: 'Combined (explicitEmit() + USDC transfer)', value: 'combined' }
                    ]}
                  />
                  <div className="my-2 text-center">
                    {isCheckingPermission && (
                      <Text variant="small" color="muted">
                        Checking permissions...
                      </Text>
                    )}
                    {!isCheckingPermission && hasPermission && permissionType !== 'none' && (
                      <Text variant="small" color="positive">
                        Permission already granted for this session.
                      </Text>
                    )}
                    {checkPermissionError && (
                      <Text variant="small" color="negative">
                        Permission check failed: {checkPermissionError.message}
                      </Text>
                    )}
                  </div>
                </div>

                {!isCheckingPermission && !hasPermission && (
                  <CardButton
                    title="Add V3 Session Permission"
                    description={
                      hasPermission
                        ? 'You already have the required permissions.'
                        : 'Request a new explicit session with the chosen permissions.'
                    }
                    isPending={isAddingExplicitSession || isCheckingPermission}
                    onClick={
                      hasPermission || isAddingExplicitSession || isCheckingPermission ? () => {} : () => handleAddPermissions()
                    }
                  />
                )}
                {addExplicitSessionError && (
                  <Text variant="small" color="negative">
                    Error: {addExplicitSessionError.message}
                  </Text>
                )}

                <Text className="mt-4" variant="small-bold" color="muted">
                  Test Explicit Permission transactions
                </Text>

                <CardButton
                  title="Send conditionally allowed transaction"
                  description="Calls explicitEmit() on test contract. (Also uses USDC permission on Optimism for fee option)"
                  isPending={isPendingPermissionedTxn}
                  onClick={runSendConditionallyAllowedV3Transaction}
                />

                {networkForCurrentChainId.blockExplorer && lastPermissionedTxnDataHash && (
                  <Text className="ml-4" variant="small" underline color="primary" asChild>
                    <a
                      href={`${networkForCurrentChainId.blockExplorer.rootUrl}/tx/${lastPermissionedTxnDataHash}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      View permissioned transaction on {networkForCurrentChainId.blockExplorer.name}
                    </a>
                  </Text>
                )}
                {permissionedTxnError && (
                  <Text className="ml-4" variant="small" color="negative">
                    Transaction failed: {permissionedTxnError.message}
                  </Text>
                )}

                <CardButton
                  title="Send via wallet popup"
                  description="Always opens the wallet popup (no permission check)."
                  isPending={isPendingWalletTransaction}
                  onClick={runSendWalletTransaction}
                />
                {networkForCurrentChainId.blockExplorer && lastWalletTxnDataHash && (
                  <Text className="ml-4" variant="small" underline color="primary" asChild>
                    <a
                      href={`${networkForCurrentChainId.blockExplorer.rootUrl}/tx/${lastWalletTxnDataHash}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      View wallet transaction on {networkForCurrentChainId.blockExplorer.name}
                    </a>
                  </Text>
                )}
                {sendWalletTransactionError && (
                  <Text className="ml-4" variant="small" color="negative">
                    Wallet transaction failed: {sendWalletTransactionError.message}
                  </Text>
                )}
              </>
            )}

            {pendingFeeOptionConfirmation && (
              <div className="my-3">
                <Select
                  name="feeOption"
                  label="Pick a fee option"
                  onValueChange={val => {
                    const selected = pendingFeeOptionConfirmation?.options?.find(option => option.token.name === val)
                    if (selected) {
                      setSelectedFeeOptionTokenName(selected.token.name)
                      setFeeOptionAlert(undefined)
                    }
                  }}
                  value={selectedFeeOptionTokenName || ''}
                  options={[
                    ...pendingFeeOptionConfirmation.options.map(option => ({
                      label: (
                        <div className="flex items-start flex-col">
                          <div className="flex flex-row">
                            <Text variant="xsmall">Fee (in {option.token.name}): </Text>{' '}
                            <Text variant="xsmall">{formatUnits(BigInt(option.value), option.token.decimals || 0)}</Text>
                          </div>
                          <div className="flex flex-row">
                            <Text>Wallet balance for {option.token.name}: </Text>{' '}
                            <Text>{'balanceFormatted' in option ? option.balanceFormatted : null}</Text>
                          </div>
                        </div>
                      ),
                      value: option.token.name
                    }))
                  ]}
                />
                <div className="flex my-2 items-center justify-center flex-col">
                  <Button
                    onClick={() => {
                      const selected = pendingFeeOptionConfirmation?.options?.find(
                        option => option.token.name === selectedFeeOptionTokenName
                      )

                      if (!selected) {
                        setFeeOptionAlert({
                          title: 'No option selected',
                          description: 'Please select a fee option before confirming.',
                          variant: 'warning'
                        })
                        return
                      }

                      if (!('hasEnoughBalanceForFee' in selected) || !selected.hasEnoughBalanceForFee) {
                        console.log('Insufficient balance for selected option')
                        setFeeOptionAlert({
                          title: 'Insufficient balance',
                          description: `You do not have enough balance to pay the fee with ${selected.token.name}, please make sure you have enough balance in your wallet for the selected fee option.`,
                          secondaryDescription: 'You can also switch network to Arbitrum Sepolia to test a gasless transaction.',
                          variant: 'warning'
                        })
                        return
                      }

                      const feeTokenAddress: string | null =
                        selected.token.contractAddress === zeroAddress || selected.token.contractAddress === null
                          ? null
                          : selected.token.contractAddress || null

                      console.log('Confirming fee option with token address:', feeTokenAddress)
                      if (pendingFeeOptionConfirmation?.id && feeTokenAddress) {
                        confirmPendingFeeOption(pendingFeeOptionConfirmation.id, feeTokenAddress)
                      }
                    }}
                    label="Confirm fee option"
                  />
                  {feeOptionAlert && (
                    <div className="mt-3">
                      <Alert
                        title={feeOptionAlert.title}
                        description={feeOptionAlert.description}
                        secondaryDescription={feeOptionAlert.secondaryDescription}
                        variant={feeOptionAlert.variant}
                        buttonProps={feeOptionAlert.buttonProps}
                      />
                    </div>
                  )}
                </div>
              </div>
            )}

            <Text className="mt-4" variant="small-bold" color="muted">
              Sign Messages
            </Text>

            <CardButton
              title="Sign message"
              description="Sign a message with your wallet"
              onClick={signMessage}
              isPending={isSigningMessage}
            />
            {isMessageValid && (
              <Card className="flex text-primary flex-col gap-2" style={{ width: '332px' }}>
                <Text variant="medium">Signed message:</Text>
                <Text>{messageToSign}</Text>
                <Text variant="medium">Signature:</Text>
                <Text variant="code" ellipsis asChild>
                  <p>{messageSig}</p>
                </Text>
                <Text variant="medium">
                  isValid: <Text variant="code">{isMessageValid.toString()}</Text>
                </Text>
              </Card>
            )}

            <CardButton
              title="Sign SIWE Message"
              description="Sign a SIWE message with your wallet"
              onClick={signSIWE}
              isPending={isSigningSIWE}
            />
            {isSIWEValid && (
              <Card className="flex text-primary flex-col gap-2" style={{ width: '332px' }}>
                <Text variant="medium">Signed SIWE message:</Text>
                <Text>{messageToSign}</Text>
                <Text variant="medium">Signature:</Text>
                <Text variant="code" ellipsis asChild>
                  <p>{siweSig}</p>
                </Text>
                <Text variant="medium">
                  isValid: <Text variant="code">{isSIWEValid.toString()}</Text>
                </Text>
              </Card>
            )}

            <CardButton
              title="Sign typed data"
              description="Sign typed data with your wallet"
              onClick={signTypedData}
              isPending={isSigningTypedData}
            />
            {typedDataSig && (
              <Card className="flex text-primary flex-col gap-2" style={{ width: '332px' }}>
                <Text variant="medium">Signed typed data:</Text>
                <Text variant="code" asChild>
                  <p>
                    {JSON.stringify(
                      {
                        domain,
                        types,
                        primaryType: 'Person',
                        message: value
                      },
                      null,
                      2
                    )}
                  </p>
                </Text>
                <Text variant="medium">Signature:</Text>
                <Text variant="code" ellipsis asChild>
                  <p>{typedDataSig}</p>
                </Text>
                <Text variant="medium">
                  isValid: <Text variant="code">{isTypedDataValid?.toString()}</Text>
                </Text>
              </Card>
            )}

            <Text className="mt-4" variant="small-bold" color="muted">
              Misc
            </Text>

            {(chainId === ChainId.ARBITRUM_NOVA || chainId === ChainId.ARBITRUM_SEPOLIA) && (
              <CardButton
                title="Mint an NFT"
                description="Test minting an NFT to your wallet"
                isPending={isPendingMintTxn}
                onClick={runMintNFT}
              />
            )}
            {mintTxnError && (
              <Text className="ml-4" variant="small" color="negative">
                Mint failed: {mintTxnError.message}
              </Text>
            )}
            {networkForCurrentChainId.blockExplorer &&
              lastTxnDataHash2 &&
              ((mintTxnData as any)?.chainId === chainId || mintTxnData) && (
                <Text className="ml-4" variant="small" underline color="primary" asChild>
                  <a
                    href={`${networkForCurrentChainId.blockExplorer.rootUrl}/tx/${(mintTxnData as any).hash ?? mintTxnData}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    View on {networkForCurrentChainId.blockExplorer.name}
                  </a>
                </Text>
              )}

            <CardButton
              title="Generate EthAuth proof"
              description="Generate EthAuth proof (result in console)"
              onClick={generateEthAuthProof}
            />
          </div>
        </div>
      </div>
    </>
  )
}
