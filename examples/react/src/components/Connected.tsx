import { Box, Button, Card, Modal, Select, Switch, Text, TextInput, breakpoints } from '@0xsequence/design-system'
import {
  useStorage,
  useWaasFeeOptions,
  useIndexerClient,
  signEthAuthProof,
  validateEthProof,
  getModalPositionCss
} from '@0xsequence/kit'
import { useCheckoutModal, useAddFundsModal, useERC1155SaleContractPaymentModal, useSwapModal } from '@0xsequence/kit-checkout'
import type { SwapModalSettings } from '@0xsequence/kit-checkout'
import { CardButton, Header } from '@0xsequence/kit-example-shared-components'
import { useOpenWalletModal } from '@0xsequence/kit-wallet'
import { allNetworks, ChainId } from '@0xsequence/network'
import { ethers } from 'ethers'
import { AnimatePresence } from 'framer-motion'
import React, { ComponentProps, useEffect } from 'react'
import { formatUnits, parseUnits } from 'viem'
import {
  useAccount,
  useChainId,
  useConnections,
  usePublicClient,
  useSendTransaction,
  useWalletClient,
  useWriteContract
} from 'wagmi'

import { messageToSign } from '../constants'
import { abi } from '../constants/nft-abi'
import { delay, getCheckoutSettings, getOrderbookCalldata } from '../utils'

// append ?debug to url to enable debug mode
const searchParams = new URLSearchParams(location.search)
const isDebugMode = searchParams.has('debug')

export const Connected = () => {
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

  const connections = useConnections()

  const isWaasConnection = connections.find(c => c.connector.id.includes('waas')) !== undefined

  const { data: txnData, sendTransaction, isPending: isPendingSendTxn, error: sendTransactionError } = useSendTransaction()
  const { data: txnData2, isPending: isPendingMintTxn, writeContract } = useWriteContract()

  const [isSigningMessage, setIsSigningMessage] = React.useState(false)
  const [isMessageValid, setIsMessageValid] = React.useState<boolean | undefined>()
  const [messageSig, setMessageSig] = React.useState<string | undefined>()

  const [lastTxnDataHash, setLastTxnDataHash] = React.useState<string | undefined>()
  const [lastTxnDataHash2, setLastTxnDataHash2] = React.useState<string | undefined>()

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
      const nativeTokenBalance = await indexerClient.getEtherBalance({ accountAddress: account })

      const tokenBalances = await indexerClient.getTokenBalances({
        accountAddress: account
      })

      const balances = pendingFeeOptionConfirmation.options.map(option => {
        if (option.token.contractAddress === null) {
          return {
            tokenName: option.token.name,
            decimals: option.token.decimals || 0,
            balance: nativeTokenBalance.balance.balanceWei
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
      setLastTxnDataHash2((txnData2 as any).hash ?? txnData)
    }
  }, [txnData, txnData2])

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
    // NOTE: commented code is how to send ETH value to the account
    // if (!walletClient) {
    //   return
    // }
    // const [account] = await walletClient.getAddresses()
    // sendTransaction({ to: account, value: '0', gas: null })

    // NOTE: below is a a simple contract call. See `runMintNFT`
    // on another example where you can use the wagmi `writeContract`
    // method to do the same thing.
    if (!walletClient) {
      return
    }

    // const [account] = await walletClient.getAddresses()
    const contractAbiInterface = new ethers.Interface(['function demo()'])

    // sendTransaction({ to: account, value: BigInt(0), gas: null })
    const data = contractAbiInterface.encodeFunctionData('demo', []) as `0x${string}`

    sendTransaction({
      to: '0x37470dac8a0255141745906c972e414b1409b470',
      data,
      gas: null
    })
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

    // // ERC-20 contract
    const currencyAddress = '0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359'
    const salesContractAddress = '0xe65b75eb7c58ffc0bf0e671d64d0e1c6cd0d3e5b'
    const collectionAddress = '0xdeb398f41ccd290ee5114df7e498cf04fac916cb'
    const price = '20000'

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
      creditCardProviders: ['sardine'],
      isDev: true,
      copyrightText: 'ⓒ2024 Sequence',
      onSuccess: (txnHash: string) => {
        console.log('success!', txnHash)
      },
      onError: (error: Error) => {
        console.error(error)
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
        isDev: true,
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

  useEffect(() => {
    setLastTxnDataHash(undefined)
    setLastTxnDataHash2(undefined)
    setIsMessageValid(undefined)
  }, [chainId])

  return (
    <>
      <Header />

      <Box paddingX="4" flexDirection="column" justifyContent="center" alignItems="center" style={{ margin: '140px 0' }}>
        <Box flexDirection="column" gap="4" style={{ maxWidth: breakpoints.md }}>
          <Box flexDirection="column" gap="2">
            <Text variant="small" color="text50" fontWeight="medium">
              Demos
            </Text>
            {/* <CardButton
        title="NFT Checkout"
        description="NFT Checkout testing"
        onClick={onClickCheckout}
      /> */}
            <CardButton
              title="Inventory"
              description="Connect a Sequence wallet to view, swap, send, and receive collections"
              onClick={() => setOpenWalletModal(true)}
            />
            <CardButton
              title="Send transaction"
              description="Send a transaction with your wallet"
              isPending={isPendingSendTxn}
              onClick={runSendTransaction}
            />

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
            <CardButton title="Add Funds" description="Buy Cryptocurrency with a Credit Card" onClick={() => onClickAddFunds()} />
            <CardButton
              title="Mint an NFT"
              description="Test minting an NFT to your wallet"
              isPending={isPendingMintTxn}
              onClick={runMintNFT}
            />
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

          {isWaasConnection && (
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
