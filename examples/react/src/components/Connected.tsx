import {
  TransactionOnRampProvider,
  useAddFundsModal,
  useCheckoutModal,
  useERC1155SaleContractCheckout,
  useSelectPaymentModal,
  useSwapModal,
  useTransactionStatusModal,
  type SwapModalSettings
} from '@0xsequence/checkout'
import {
  getModalPositionCss,
  signEthAuthProof,
  useOpenConnectModal,
  useSocialLink,
  useStorage,
  useWaasFeeOptions,
  useWallets,
  validateEthProof
} from '@0xsequence/connect'
import { Button, Card, cn, Modal, Scroll, Switch, Text, TextInput } from '@0xsequence/design-system'
import { allNetworks, ChainId } from '@0xsequence/network'
import { useOpenWalletModal } from '@0xsequence/wallet-widget'
import { CardButton, Header, WalletListItem } from 'example-shared-components'
import { AnimatePresence } from 'motion/react'
import React, { useEffect, type ComponentProps } from 'react'
import { encodeFunctionData, formatUnits, parseAbi, zeroAddress } from 'viem'
import { createSiweMessage, generateSiweNonce } from 'viem/siwe'
import { useAccount, useChainId, usePublicClient, useSendTransaction, useWalletClient, useWriteContract } from 'wagmi'

import { sponsoredContractAddresses } from '../config'
import { messageToSign } from '../constants'
import { abi } from '../constants/nft-abi'
import { delay, getCheckoutSettings, getOrderbookCalldata } from '../utils'
import { checkoutPresets } from '../utils/checkout'

import { CustomCheckout } from './CustomCheckout'
import { Select } from './Select'

// append ?debug to url to enable debug mode
const searchParams = new URLSearchParams(location.search)
const isDebugMode = searchParams.has('debug')
const checkoutProvider = searchParams.get('checkoutProvider')
const onRampProvider = searchParams.get('onRampProvider')
const checkoutPreset = searchParams.get('checkoutPreset') || 'forte-payment-erc1155-sale-native-token-testnet'

export const Connected = () => {
  const { openTransactionStatusModal } = useTransactionStatusModal()
  const [isOpenCustomCheckout, setIsOpenCustomCheckout] = React.useState(false)
  const { setOpenConnectModal } = useOpenConnectModal()
  const { address } = useAccount()
  const { openSwapModal } = useSwapModal()
  const { setOpenWalletModal } = useOpenWalletModal()
  const { triggerCheckout } = useCheckoutModal()
  const { triggerAddFunds } = useAddFundsModal()
  const { openSelectPaymentModal } = useSelectPaymentModal()
  const { setIsSocialLinkOpen } = useSocialLink()
  const { data: walletClient } = useWalletClient()
  const storage = useStorage()

  const [isCheckoutInfoModalOpen, setIsCheckoutInfoModalOpen] = React.useState(false)

  const [checkoutOrderId, setCheckoutOrderId] = React.useState('')
  const [checkoutTokenContractAddress, setCheckoutTokenContractAddress] = React.useState('')
  const [checkoutTokenId, setCheckoutTokenId] = React.useState('')

  const { wallets, setActiveWallet, disconnectWallet } = useWallets()
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

  const { openCheckoutModal, isLoading: erc1155CheckoutLoading } = useERC1155SaleContractCheckout({
    chain: 137,
    contractAddress: '0xf0056139095224f4eec53c578ab4de1e227b9597',
    wallet: address || '',
    collectionAddress: '0x92473261f2c26f2264429c451f70b0192f858795',
    items: [{ tokenId: '1', quantity: '1' }],
    onSuccess: txnHash => {
      console.log('txnHash', txnHash)
    }
  })

  const [isSigningMessage, setIsSigningMessage] = React.useState(false)
  const [isMessageValid, setIsMessageValid] = React.useState<boolean | undefined>()
  const [messageSig, setMessageSig] = React.useState<string | undefined>()
  const [isSigningSIWE, setIsSigningSIWE] = React.useState(false)
  const [siweSig, setSiweSig] = React.useState<string | undefined>()
  const [isSIWEValid, setIsSIWEValid] = React.useState<boolean | undefined>()
  const [isSigningTypedData, setIsSigningTypedData] = React.useState(false)
  const [typedDataSig, setTypedDataSig] = React.useState<string | undefined>()
  const [isTypedDataValid, setIsTypedDataValid] = React.useState<boolean | undefined>()

  const [lastTxnDataHash, setLastTxnDataHash] = React.useState<string | undefined>()
  const [lastTxnDataHash2, setLastTxnDataHash2] = React.useState<string | undefined>()
  const [lastTxnDataHash3, setLastTxnDataHash3] = React.useState<string | undefined>()

  const [confirmationEnabled, setConfirmationEnabled] = React.useState<boolean>(
    localStorage.getItem('confirmationEnabled') === 'true'
  )

  const chainId = useChainId()
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

  const [feeOptionAlert, setFeeOptionAlert] = React.useState<AlertProps | undefined>(undefined)

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
      const data = encodeFunctionData({ abi: parseAbi(['function demo()']), functionName: 'demo', args: [] })

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
    const toTokenAddress = '0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359'
    const toTokenAmount = '200000'
    const data = encodeFunctionData({ abi: parseAbi(['function demo()']), functionName: 'demo', args: [] })

    const swapModalSettings: SwapModalSettings = {
      onSuccess: () => {
        console.log('swap successful!')
      },
      chainId,
      toTokenAddress,
      toTokenAmount,
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

    const creditCardProvider = checkoutProvider || 'forte'

    openSelectPaymentModal({
      recipientAddress: address,
      creditCardProviders: [creditCardProvider],
      onRampProvider: onRampProvider ? (onRampProvider as TransactionOnRampProvider) : TransactionOnRampProvider.transak,
      transakConfig: {
        contractId: '674eb5613d739107bbd18ed2'
      },
      onSuccess: (txnHash?: string) => {
        console.log('success!', txnHash)
      },
      onError: (error: Error) => {
        console.error(error)
      },
      onClose: () => {
        console.log('modal closed!')
      },
      ...checkoutPresets[checkoutPreset as keyof typeof checkoutPresets](address || '')
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
      walletAddress: address || '',
      provider: onRampProvider ? (onRampProvider as TransactionOnRampProvider) : TransactionOnRampProvider.transak
    })
  }

  const onClickConnect = () => {
    setOpenConnectModal(true)
  }

  const onClickSocialLink = () => {
    setIsSocialLinkOpen(true)
  }

  const onClickTransactionStatus = () => {
    openTransactionStatusModal({
      chainId: 137,
      currencyAddress: zeroAddress,
      collectionAddress: '0x92473261f2c26f2264429c451f70b0192f858795',
      txHash: '0x7824a5f7107a964553f799a82d8178fd66ff5055e84f586010ccd80e5e40145b',
      items: [
        {
          tokenId: '1',
          quantity: '1',
          decimals: 18,
          price: '1000'
        }
      ]
    })
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

            {(sponsoredContractAddresses[chainId] || networkForCurrentChainId.testnet) && isWaasConnectionActive && (
              <CardButton
                title="Send sponsored transaction"
                description="Send a transaction with your wallet without paying any fees"
                isPending={isPendingSendTxn}
                onClick={runSendTransaction}
              />
            )}
            {networkForCurrentChainId.blockExplorer && lastTxnDataHash && ((txnData as any)?.chainId === chainId || txnData) && (
              <Text className="ml-4" variant="small" underline color="primary" asChild>
                <a
                  href={`${networkForCurrentChainId.blockExplorer.rootUrl}/tx/${(txnData as any).hash ?? txnData}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  View on {networkForCurrentChainId.blockExplorer.name}
                </a>
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

                      if (selected?.token.contractAddress !== undefined) {
                        if (!('hasEnoughBalanceForFee' in selected) || !selected.hasEnoughBalanceForFee) {
                          setFeeOptionAlert({
                            title: 'Insufficient balance',
                            description: `You do not have enough balance to pay the fee with ${selected.token.name}, please make sure you have enough balance in your wallet for the selected fee option.`,
                            secondaryDescription:
                              'You can also switch network to Arbitrum Sepolia to test a gasless transaction.',
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
                    <div className="mt-3" style={{ maxWidth: '332px' }}>
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
              Web SDK Checkout
            </Text>

            <CardButton title="Add Funds" description="Buy Cryptocurrency with a Credit Card" onClick={() => onClickAddFunds()} />

            {isDebugMode && (
              <>
                <CardButton title="Generate EthAuth proof" description="Generate EthAuth proof" onClick={generateEthAuthProof} />

                <CardButton
                  title="NFT Checkout"
                  description="Set orderbook order id, token contract address and token id to test checkout (on Polygon)"
                  onClick={onClickCheckout}
                />
                <CardButton
                  title="Custom Checkout"
                  description="Hook for creating custom checkout UIs"
                  onClick={() => setIsOpenCustomCheckout(true)}
                />

                <CardButton
                  title="ERC1155 Checkout"
                  description="Purchase with useERC1155SaleContractCheckout hook"
                  onClick={openCheckoutModal}
                  isPending={erc1155CheckoutLoading}
                />

                <CardButton
                  title="Transaction Status Modal"
                  description="Transaction status modal"
                  onClick={onClickTransactionStatus}
                />
              </>
            )}

            <CardButton
              title="Swap"
              description="Seamlessly swap eligible currencies in your wallet to a target currency"
              onClick={onClickSwap}
            />

            <CardButton
              title="Checkout"
              description="Purchase an NFT through various purchase methods"
              onClick={onClickSelectPayment}
            />

            {(chainId === ChainId.ARBITRUM_NOVA || chainId === ChainId.ARBITRUM_SEPOLIA || isWaasConnectionActive) && (
              <Text className="mt-4" variant="small-bold" color="muted">
                Misc
              </Text>
            )}

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
                <Text className="ml-4" variant="small" underline color="primary" asChild>
                  <a
                    href={`${networkForCurrentChainId.blockExplorer.rootUrl}/tx/${(txnData2 as any).hash ?? txnData2}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    View on {networkForCurrentChainId.blockExplorer.name}
                  </a>
                </Text>
              )}

            {isWaasConnectionActive && (
              <CardButton title="Social Link" description="Open the social link modal" onClick={() => onClickSocialLink()} />
            )}
          </div>

          {isWaasConnectionActive && (
            <div className="my-3">
              <label className="flex flex-row items-center justify-between">
                <Text fontWeight="semibold" variant="small" color="muted">
                  Confirmations
                </Text>
                <div className="flex items-center gap-2">
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
                </div>
              </label>
            </div>
          )}
        </div>
      </div>
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
            onClose={() => setIsCheckoutInfoModalOpen(false)}
          >
            <div id="sequence-kit-checkout-info-modal">
              <div className="flex pt-16 pb-8 px-6 gap-2 flex-col">
                <Text variant="medium" color="muted">
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
                <Text variant="medium" color="muted">
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
                <Text variant="medium" color="muted">
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
                  className="mt-4"
                  onClick={() => {
                    onCheckoutInfoConfirm()
                  }}
                  label="Trigger checkout"
                />
              </div>
            </div>
          </Modal>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {isOpenCustomCheckout && (
          <Modal
            contentProps={{
              style: {
                maxWidth: '400px',
                height: 'auto',
                ...getModalPositionCss('center')
              }
            }}
            scroll={false}
            onClose={() => setIsOpenCustomCheckout(false)}
          >
            <Scroll style={{ height: '600px' }}>
              <CustomCheckout />
            </Scroll>
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

const variants = {
  negative: 'bg-negative',
  warning: 'bg-warning',
  positive: 'bg-positive'
}

export const Alert = ({ title, description, secondaryDescription, variant, buttonProps, children }: AlertProps) => {
  return (
    <div className={cn('rounded-xl', variants[variant])}>
      <div className="flex bg-background-overlay rounded-xl py-4 w-full flex-col gap-3">
        <div className="flex w-full gap-2 justify-between">
          <div className="flex flex-col gap-1">
            <Text variant="normal" color="primary" fontWeight="medium">
              {title}
            </Text>

            <Text variant="normal" color="muted" fontWeight="medium">
              {description}
            </Text>

            {secondaryDescription && (
              <Text variant="normal" color="secondary" fontWeight="medium">
                {secondaryDescription}
              </Text>
            )}
          </div>

          {buttonProps ? (
            <div className="rounded-lg w-min h-min">
              <Button className="shrink-0" variant="emphasis" shape="square" {...buttonProps} />
            </div>
          ) : null}
        </div>

        {children}
      </div>
    </div>
  )
}
