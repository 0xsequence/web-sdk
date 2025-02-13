import { Box, Button, Card, Modal, Select, Switch, Text, TextInput, breakpoints } from '@0xsequence/design-system'
import {
  useStorage,
  useWaasFeeOptions,
  useIndexerClient,
  signEthAuthProof,
  validateEthProof,
  getModalPositionCss,
  useOpenConnectModal,
  ContractVerificationStatus,
  useKitWallets
} from '@0xsequence/kit'
import { useCheckoutModal, useAddFundsModal, useERC1155SaleContractPaymentModal, useSwapModal } from '@0xsequence/kit-checkout'
import type { SwapModalSettings } from '@0xsequence/kit-checkout'
import { CardButton, Header, WalletListItem } from '@0xsequence/kit-example-shared-components'
import { useOpenWalletModal } from '@0xsequence/kit-wallet'
import { allNetworks, ChainId } from '@0xsequence/network'
import { ethers } from 'ethers'
import { AnimatePresence } from 'framer-motion'
import React, { ComponentProps, useEffect } from 'react'
import { formatUnits, parseUnits } from 'viem'
import { useAccount, useChainId, usePublicClient, useSendTransaction, useWalletClient, useWriteContract } from 'wagmi'

import { sponsoredContractAddresses } from '../config'
import { messageToSign } from '../constants'
import { abi } from '../constants/nft-abi'
import { delay, getCheckoutSettings, getOrderbookCalldata } from '../utils'

// append ?debug to url to enable debug mode
const searchParams = new URLSearchParams(location.search)
const isDebugMode = searchParams.has('debug')

export const Connected = () => {
  const { setOpenConnectModal } = useOpenConnectModal()

  const { address } = useAccount()
  const { openSwapModal } = useSwapModal()
  const { setOpenWalletModal } = useOpenWalletModal()
  const { triggerCheckout } = useCheckoutModal()
  const { triggerAddFunds } = useAddFundsModal()
  const { openERC1155SaleContractPaymentModal } = useERC1155SaleContractPaymentModal()
  const { data: walletClient } = useWalletClient()
  const storage = useStorage()

  const [isCheckoutInfoModalOpen, setIsCheckoutInfoModalOpen] = React.useState(false)

  const [checkoutOrderId, setCheckoutOrderId] = React.useState('')
  const [checkoutTokenContractAddress, setCheckoutTokenContractAddress] = React.useState('')
  const [checkoutTokenId, setCheckoutTokenId] = React.useState('')

  const { wallets, setActiveWallet, disconnectWallet } = useKitWallets()
  const isWaasConnectionActive = wallets.some(w => w.isEmbedded && w.isActive)

  const {
    data: txnData,
    sendTransaction,
    isPending: isPendingSendTxn,
    error: sendTransactionError,
    reset: resetSendTransaction
  } = useSendTransaction()
  const { data: txnData2, isPending: isPendingMintTxn, writeContract, reset: resetWriteContract } = useWriteContract()
  const {
    data: txnData3,
    sendTransaction: sendUnsponsoredTransaction,
    isPending: isPendingSendUnsponsoredTxn,
    error: sendUnsponsoredTransactionError,
    reset: resetSendUnsponsoredTransaction
  } = useSendTransaction()

  const [isSigningMessage, setIsSigningMessage] = React.useState(false)
  const [isMessageValid, setIsMessageValid] = React.useState<boolean | undefined>()
  const [messageSig, setMessageSig] = React.useState<string | undefined>()
  const [isSigningTypedData, setIsSigningTypedData] = React.useState(false)
  const [typedDataSig, setTypedDataSig] = React.useState<string | undefined>()
  const [isTypedDataValid, setIsTypedDataValid] = React.useState<boolean | undefined>()

  const [lastTxnDataHash, setLastTxnDataHash] = React.useState<string | undefined>()
  const [lastTxnDataHash2, setLastTxnDataHash2] = React.useState<string | undefined>()
  const [lastTxnDataHash3, setLastTxnDataHash3] = React.useState<string | undefined>()

  const [confirmationEnabled, setConfirmationEnabled] = React.useState<boolean>(
    localStorage.getItem('confirmationEnabled') === 'true'
  )

  const [pendingFeeOptionConfirmation, confirmPendingFeeOption] = useWaasFeeOptions()

  const [selectedFeeOptionTokenName, setSelectedFeeOptionTokenName] = React.useState<string | undefined>()

  useEffect(() => {
    if (pendingFeeOptionConfirmation) {
      setSelectedFeeOptionTokenName(pendingFeeOptionConfirmation.options[0].token.name)
    }
  }, [pendingFeeOptionConfirmation])

  useEffect(() => {
    if (!sendTransactionError) {
      return
    }

    if (sendTransactionError instanceof Error) {
      console.error(sendTransactionError.cause)
    } else {
      console.error(sendTransactionError)
    }
  }, [sendTransactionError])

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

  const chainId = useChainId()

  const indexerClient = useIndexerClient(chainId)

  const [feeOptionBalances, setFeeOptionBalances] = React.useState<{ tokenName: string; decimals: number; balance: string }[]>([])

  const [feeOptionAlert, setFeeOptionAlert] = React.useState<AlertProps | undefined>(undefined)

  useEffect(() => {
    checkTokenBalancesForFeeOptions()
  }, [pendingFeeOptionConfirmation])

  const checkTokenBalancesForFeeOptions = async () => {
    if (pendingFeeOptionConfirmation && walletClient) {
      const [account] = await walletClient.getAddresses()
      const nativeTokenBalance = await indexerClient.getNativeTokenBalance({ accountAddress: account })

      const tokenBalances = await indexerClient.getTokenBalancesSummary({
        filter: {
          accountAddresses: [account],
          contractStatus: ContractVerificationStatus.ALL,
          omitNativeBalances: true
        }
      })

      const balances = pendingFeeOptionConfirmation.options.map(option => {
        if (option.token.contractAddress === null) {
          return {
            tokenName: option.token.name,
            decimals: option.token.decimals || 0,
            balance: nativeTokenBalance.balance.balance
          }
        } else {
          return {
            tokenName: option.token.name,
            decimals: option.token.decimals || 0,
            balance:
              tokenBalances.balances.find(b => b.contractAddress.toLowerCase() === option.token.contractAddress?.toLowerCase())
                ?.balance || '0'
          }
        }
      })

      setFeeOptionBalances(balances)
    }
  }

  const networkForCurrentChainId = allNetworks.find(n => n.chainId === chainId)!

  const publicClient = usePublicClient({ chainId })

  const generateEthAuthProof = async () => {
    if (!walletClient || !publicClient || !storage) {
      return
    }

    try {
      const proof = await signEthAuthProof(walletClient, storage)
      console.log('proof:', proof)

      const isValid = await validateEthProof(walletClient, publicClient, proof)
      console.log('isValid?:', isValid)
    } catch (e) {
      console.error(e)
    }
  }

  useEffect(() => {
    if (txnData) {
      setLastTxnDataHash((txnData as any).hash ?? txnData)
    }
    if (txnData2) {
      setLastTxnDataHash2((txnData2 as any).hash ?? txnData2)
    }
    if (txnData3) {
      setLastTxnDataHash3((txnData3 as any).hash ?? txnData3)
    }
  }, [txnData, txnData2, txnData3])

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

  const runSendTransaction = async () => {
    if (!walletClient) {
      return
    }

    if (networkForCurrentChainId.testnet) {
      const [account] = await walletClient.getAddresses()

      sendTransaction({
        to: account,
        value: BigInt(0),
        gas: null
      })
    } else {
      const sponsoredContractAddress = sponsoredContractAddresses[chainId]

      const contractAbiInterface = new ethers.Interface(['function demo()'])
      const data = contractAbiInterface.encodeFunctionData('demo', []) as `0x${string}`

      sendTransaction({
        to: sponsoredContractAddress,
        data,
        gas: null
      })
    }
  }

  const runSendUnsponsoredTransaction = async () => {
    if (!walletClient) {
      return
    }

    const [account] = await walletClient.getAddresses()

    sendUnsponsoredTransaction({ to: account, value: BigInt(0), gas: null })
  }

  const runMintNFT = async () => {
    if (!walletClient) {
      return
    }

    const [account] = await walletClient.getAddresses()

    writeContract({
      address: '0x0d402C63cAe0200F0723B3e6fa0914627a48462E',
      abi,
      functionName: 'awardItem',
      args: [account, 'https://dev-metadata.sequence.app/projects/277/collections/62/tokens/0.json']
    })
  }

  const onClickCheckout = () => {
    setIsCheckoutInfoModalOpen(true)
  }

  const onClickSwap = () => {
    const chainId = 137
    const currencyAddress = '0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359'
    const currencyAmount = '20000'

    const contractAbiInterface = new ethers.Interface(['function demo()'])

    const data = contractAbiInterface.encodeFunctionData('demo', []) as `0x${string}`

    const swapModalSettings: SwapModalSettings = {
      onSuccess: () => {
        console.log('swap successful!')
      },
      chainId,
      currencyAddress,
      currencyAmount,
      postSwapTransactions: [
        {
          to: '0x37470dac8a0255141745906c972e414b1409b470',
          data
        }
      ],
      title: 'Swap and Pay',
      description: 'Select a token in your wallet to swap to 0.2 USDC.'
    }

    openSwapModal(swapModalSettings)
  }

  const onClickSelectPayment = () => {
    if (!address) {
      return
    }

    // NATIVE token sale
    // const currencyAddress = ethers.ZeroAddress
    // const salesContractAddress = '0xf0056139095224f4eec53c578ab4de1e227b9597'
    // const collectionAddress = '0x92473261f2c26f2264429c451f70b0192f858795'
    // const price = '200000000000000'
    // const contractId = '674eb55a3d739107bbd18ecb'

    // // ERC-20 contract
    const currencyAddress = '0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359'
    const salesContractAddress = '0xe65b75eb7c58ffc0bf0e671d64d0e1c6cd0d3e5b'
    const collectionAddress = '0xdeb398f41ccd290ee5114df7e498cf04fac916cb'
    const price = '20000'
    const contractId = '674eb5613d739107bbd18ed2'

    const chainId = 137

    openERC1155SaleContractPaymentModal({
      collectibles: [
        {
          tokenId: '1',
          quantity: '1'
        }
      ],
      chain: chainId,
      price,
      targetContractAddress: salesContractAddress,
      recipientAddress: address,
      currencyAddress,
      collectionAddress,
      creditCardProviders: ['sardine', 'transak'],
      transakConfig: {
        contractId,
        apiKey: '5911d9ec-46b5-48fa-a755-d59a715ff0cf'
      },
      copyrightText: 'ⓒ2024 Sequence',
      onSuccess: (txnHash: string) => {
        console.log('success!', txnHash)
      },
      onError: (error: Error) => {
        console.error(error)
      },
      onClose: () => {
        console.log('modal closed!')
      }
    })
  }

  const onCheckoutInfoConfirm = () => {
    setIsCheckoutInfoModalOpen(false)
    if (checkoutOrderId !== '' && checkoutTokenContractAddress !== '' && checkoutTokenId !== '') {
      const chainId = ChainId.POLYGON
      const orderbookAddress = '0xB537a160472183f2150d42EB1c3DD6684A55f74c'
      const recipientAddress = address || ''
      const nftQuantity = '1'

      const checkoutSettings = getCheckoutSettings({
        chainId,
        contractAddress: orderbookAddress,
        recipientAddress,
        currencyQuantity: '100000',
        currencySymbol: 'USDC',
        currencyAddress: '0x3c499c542cef5e3811e1192ce70d8cc03d5c3359',
        currencyDecimals: '6',
        nftId: checkoutTokenId,
        nftAddress: checkoutTokenContractAddress,
        nftQuantity,
        approvedSpenderAddress: orderbookAddress,
        calldata: getOrderbookCalldata({
          orderId: checkoutOrderId,
          quantity: nftQuantity,
          recipient: recipientAddress
        })
      })
      triggerCheckout(checkoutSettings)
    }
  }

  const onClickAddFunds = () => {
    triggerAddFunds({
      walletAddress: address || ''
    })
  }

  const onClickConnect = () => {
    setOpenConnectModal(true)
  }

  useEffect(() => {
    setLastTxnDataHash(undefined)
    setLastTxnDataHash2(undefined)
    setLastTxnDataHash3(undefined)
    setIsMessageValid(undefined)
    setTypedDataSig(undefined)
    resetWriteContract()
    resetSendUnsponsoredTransaction()
    resetSendTransaction()
    setFeeOptionBalances([])
  }, [chainId, address])

  return (
    <>
      <Header />

      <Box paddingX="4" flexDirection="column" justifyContent="center" alignItems="center" style={{ margin: '140px 0' }}>
        <Box flexDirection="column" gap="4" style={{ maxWidth: breakpoints.md }}>
          <Box flexDirection="column" gap="2">
            <Box marginY="3" flexDirection="column" gap="2">
              <Text fontWeight="semibold" variant="small" color="text50">
                Connected Wallets
              </Text>
              {[...wallets]
                .sort((a, b) => {
                  // Sort embedded wallet to the top
                  if (a.isEmbedded && !b.isEmbedded) return -1
                  if (!a.isEmbedded && b.isEmbedded) return 1
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
            </Box>

            <Box gap="2" flexDirection="row" alignItems="center" justifyContent="center">
              <Button shape="square" onClick={onClickConnect} variant="feature" size="sm" label="Connect another wallet" />
            </Box>

            <Text variant="small" color="text50" fontWeight="medium" marginTop="6">
              Demos
            </Text>
            <CardButton title="Inventory" description="View all tokens in your wallet" onClick={() => setOpenWalletModal(true)} />
            {(sponsoredContractAddresses[chainId] || networkForCurrentChainId.testnet) && isWaasConnectionActive && (
              <CardButton
                title="Send sponsored transaction"
                description="Send a transaction with your wallet without paying any fees"
                isPending={isPendingSendTxn}
                onClick={runSendTransaction}
              />
            )}
            {networkForCurrentChainId.blockExplorer && lastTxnDataHash && ((txnData as any)?.chainId === chainId || txnData) && (
              <Text
                as="a"
                marginLeft="4"
                variant="small"
                underline
                href={`${networkForCurrentChainId.blockExplorer.rootUrl}/tx/${(txnData as any).hash ?? txnData}`}
                target="_blank"
                rel="noreferrer"
              >
                View on {networkForCurrentChainId.blockExplorer.name}
              </Text>
            )}

            {!networkForCurrentChainId.testnet && (
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
                <Text
                  as="a"
                  marginLeft="4"
                  variant="small"
                  underline
                  href={`${networkForCurrentChainId.blockExplorer.rootUrl}/tx/${(txnData3 as any).hash ?? txnData3}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  View on {networkForCurrentChainId.blockExplorer.name}
                </Text>
              )}

            <CardButton
              title="Sign message"
              description="Sign a message with your wallet"
              onClick={signMessage}
              isPending={isSigningMessage}
            />
            {isMessageValid && (
              <Card style={{ width: '332px' }} color={'text100'} flexDirection={'column'} gap={'2'}>
                <Text variant="medium">Signed message:</Text>
                <Text>{messageToSign}</Text>
                <Text variant="medium">Signature:</Text>
                <Text variant="code" as="p" ellipsis>
                  {messageSig}
                </Text>
                <Text variant="medium">
                  isValid: <Text variant="code">{isMessageValid.toString()}</Text>
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
              <Card style={{ width: '332px' }} color={'text100'} flexDirection={'column'} gap={'2'}>
                <Text variant="medium">Signed typed data:</Text>
                <Text variant="code" as="p">
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
                </Text>
                <Text variant="medium">Signature:</Text>
                <Text variant="code" as="p" ellipsis>
                  {typedDataSig}
                </Text>
                <Text variant="medium">
                  isValid: <Text variant="code">{isTypedDataValid?.toString()}</Text>
                </Text>
              </Card>
            )}
            <CardButton title="Add Funds" description="Buy Cryptocurrency with a Credit Card" onClick={() => onClickAddFunds()} />
            {(chainId === ChainId.ARBITRUM_NOVA || chainId === ChainId.ARBITRUM_SEPOLIA) && (
              <CardButton
                title="Mint an NFT"
                description="Test minting an NFT to your wallet"
                isPending={isPendingMintTxn}
                onClick={runMintNFT}
              />
            )}
            {networkForCurrentChainId.blockExplorer &&
              lastTxnDataHash2 &&
              ((txnData2 as any)?.chainId === chainId || txnData2) && (
                <Text
                  as="a"
                  marginLeft="4"
                  variant="small"
                  underline
                  href={`${networkForCurrentChainId.blockExplorer.rootUrl}/tx/${(txnData2 as any).hash ?? txnData2}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  View on {networkForCurrentChainId.blockExplorer.name}
                </Text>
              )}

            {isDebugMode && (
              <>
                <CardButton title="Generate EthAuth proof" description="Generate EthAuth proof" onClick={generateEthAuthProof} />

                <CardButton
                  title="NFT Checkout"
                  description="Set orderbook order id, token contract address and token id to test checkout (on Polygon)"
                  onClick={onClickCheckout}
                />
              </>
            )}
            <CardButton
              title="Swap with Sequence Pay"
              description="Seamlessly swap eligible currencies in your wallet to a target currency"
              onClick={onClickSwap}
            />

            <CardButton
              title="Checkout with Sequence Pay"
              description="Purchase an NFT through various purchase methods"
              onClick={onClickSelectPayment}
            />
          </Box>

          {pendingFeeOptionConfirmation && feeOptionBalances.length > 0 && (
            <Box marginY="3">
              <Select
                name="feeOption"
                labelLocation="top"
                label="Pick a fee option"
                onValueChange={val => {
                  const selected = pendingFeeOptionConfirmation?.options?.find(option => option.token.name === val)
                  if (selected) {
                    setSelectedFeeOptionTokenName(selected.token.name)
                    setFeeOptionAlert(undefined)
                  }
                }}
                value={selectedFeeOptionTokenName}
                options={[
                  ...pendingFeeOptionConfirmation?.options?.map(option => ({
                    label: (
                      <Box alignItems="flex-start" flexDirection="column">
                        <Box flexDirection="row">
                          <Text variant="xsmall">Fee (in {option.token.name}): </Text>{' '}
                          <Text variant="xsmall">{formatUnits(BigInt(option.value), option.token.decimals || 0)}</Text>
                        </Box>
                        <Box flexDirection="row">
                          <Text>Wallet balance for {option.token.name}: </Text>{' '}
                          <Text>
                            {formatUnits(
                              BigInt(feeOptionBalances.find(b => b.tokenName === option.token.name)?.balance || '0'),
                              option.token.decimals || 0
                            )}
                          </Text>
                        </Box>
                      </Box>
                    ),
                    value: option.token.name
                  }))
                ]}
              />
              <Box marginY="2" alignItems="center" justifyContent="center" flexDirection="column">
                <Button
                  onClick={() => {
                    const selected = pendingFeeOptionConfirmation?.options?.find(
                      option => option.token.name === selectedFeeOptionTokenName
                    )

                    if (selected?.token.contractAddress !== undefined) {
                      // check if wallet has enough balance, should be balance > feeOption.value
                      const balance = parseUnits(
                        feeOptionBalances.find(b => b.tokenName === selected.token.name)?.balance || '0',
                        selected.token.decimals || 0
                      )
                      const feeOptionValue = parseUnits(selected.value, selected.token.decimals || 0)
                      if (balance && balance < feeOptionValue) {
                        setFeeOptionAlert({
                          title: 'Insufficient balance',
                          description: `You do not have enough balance to pay the fee with ${selected.token.name}, please make sure you have enough balance in your wallet for the selected fee option.`,
                          secondaryDescription: 'You can also switch network to Arbitrum Sepolia to test a gasless transaction.',
                          variant: 'warning'
                        })
                        return
                      }

                      confirmPendingFeeOption(pendingFeeOptionConfirmation?.id, selected.token.contractAddress)
                    }
                  }}
                  label="Confirm fee option"
                />
                {feeOptionAlert && (
                  <Box marginTop="3" style={{ maxWidth: '332px' }}>
                    <Alert
                      title={feeOptionAlert.title}
                      description={feeOptionAlert.description}
                      secondaryDescription={feeOptionAlert.secondaryDescription}
                      variant={feeOptionAlert.variant}
                      buttonProps={feeOptionAlert.buttonProps}
                    />
                  </Box>
                )}
              </Box>
            </Box>
          )}

          {isWaasConnectionActive && (
            <Box marginY="3">
              <Box as="label" flexDirection="row" alignItems="center" justifyContent="space-between">
                <Text fontWeight="semibold" variant="small" color="text50">
                  Confirmations
                </Text>

                <Box alignItems="center" gap="2">
                  <Switch
                    name="confirmations"
                    checked={confirmationEnabled}
                    onCheckedChange={async (checked: boolean) => {
                      if (checked) {
                        localStorage.setItem('confirmationEnabled', 'true')
                        setConfirmationEnabled(true)
                      } else {
                        localStorage.removeItem('confirmationEnabled')
                        setConfirmationEnabled(false)
                      }

                      await delay(300)

                      window.location.reload()
                    }}
                  />
                </Box>
              </Box>
            </Box>
          )}
        </Box>
      </Box>

      <AnimatePresence>
        {isCheckoutInfoModalOpen && (
          <Modal
            contentProps={{
              style: {
                maxWidth: '400px',
                height: 'auto',
                ...getModalPositionCss('center')
              }
            }}
            scroll={false}
            backdropColor="backgroundBackdrop"
            onClose={() => setIsCheckoutInfoModalOpen(false)}
          >
            <Box id="sequence-kit-checkout-info-modal">
              <Box paddingTop="16" paddingBottom="8" paddingX="6" gap="2" flexDirection="column">
                <Text variant="medium" color="text50">
                  Order ID
                </Text>
                <TextInput
                  autoFocus
                  name="orderId"
                  value={checkoutOrderId}
                  onChange={ev => setCheckoutOrderId(ev.target.value)}
                  placeholder="Order Id"
                  data-1p-ignore
                />
                <Text variant="medium" color="text50">
                  Token Contract Address
                </Text>
                <TextInput
                  autoFocus
                  name="tokenContractAddress"
                  value={checkoutTokenContractAddress}
                  onChange={ev => setCheckoutTokenContractAddress(ev.target.value)}
                  placeholder="Token Contract Address"
                  data-1p-ignore
                />
                <Text variant="medium" color="text50">
                  Token ID
                </Text>
                <TextInput
                  autoFocus
                  name="tokenId"
                  value={checkoutTokenId}
                  onChange={ev => setCheckoutTokenId(ev.target.value)}
                  placeholder="Token Id"
                  data-1p-ignore
                />

                <Button
                  marginTop="4"
                  onClick={() => {
                    onCheckoutInfoConfirm()
                  }}
                  label="Trigger checkout"
                />
              </Box>
            </Box>
          </Modal>
        )}
      </AnimatePresence>
    </>
  )
}

export type AlertProps = {
  title: string
  description: string
  secondaryDescription?: string
  variant: 'negative' | 'warning' | 'positive'
  buttonProps?: ComponentProps<typeof Button>
  children?: React.ReactNode
}

export const Alert = ({ title, description, secondaryDescription, variant, buttonProps, children }: AlertProps) => {
  return (
    <Box borderRadius="md" background={variant}>
      <Box
        background="backgroundOverlay"
        borderRadius="md"
        paddingX={{ sm: '4', md: '5' }}
        paddingY="4"
        width="full"
        flexDirection="column"
        gap="3"
      >
        <Box width="full" flexDirection={{ sm: 'column', md: 'row' }} gap="2" justifyContent="space-between">
          <Box flexDirection="column" gap="1">
            <Text variant="normal" color="text100" fontWeight="medium">
              {title}
            </Text>

            <Text variant="normal" color="text50" fontWeight="medium">
              {description}
            </Text>

            {secondaryDescription && (
              <Text variant="normal" color="text80" fontWeight="medium">
                {secondaryDescription}
              </Text>
            )}
          </Box>

          {buttonProps ? (
            <Box background={variant} borderRadius="sm" width={'min'} height={'min'}>
              <Button variant="emphasis" shape="square" flexShrink="0" {...buttonProps} />
            </Box>
          ) : null}
        </Box>

        {children}
      </Box>
    </Box>
  )
}
