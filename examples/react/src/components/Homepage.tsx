import {
  Box,
  Button,
  Card,
  Text,
  Image,
  SunIcon,
  MoonIcon,
  SignoutIcon,
  useTheme,
  Spinner,
  useMediaQuery,
  Switch,
  IconButton,
  CheckmarkIcon,
  Modal,
  TextInput
} from '@0xsequence/design-system'
import {
  useOpenConnectModal,
  signEthAuthProof,
  validateEthProof,
  useTheme as useKitTheme,
  getModalPositionCss,
  useStorage
} from '@0xsequence/kit'
import { useCheckoutModal } from '@0xsequence/kit-checkout'
import { useOpenWalletModal } from '@0xsequence/kit-wallet'
import { allNetworks } from '@0xsequence/network'
import { ethers } from 'ethers'
import { AnimatePresence } from 'framer-motion'
import React, { useEffect } from 'react'
import {
  useDisconnect,
  useAccount,
  useWalletClient,
  usePublicClient,
  useChainId,
  useSwitchChain,
  useSendTransaction,
  useWriteContract,
  useConnections
} from 'wagmi'

import { ConnectionMode } from '../config'
import { messageToSign } from '../constants'
import { abi } from '../constants/nft-abi'
import { delay, formatAddress, getCheckoutSettings } from '../utils'

import { Footer } from './Footer'

// append ?debug to url to enable debug mode
const searchParams = new URLSearchParams(location.search)
const connectionMode: ConnectionMode = searchParams.get('mode') === 'universal' ? 'universal' : 'waas'
const isDebugMode = searchParams.has('debug')

export const Homepage = () => {
  const { theme, setTheme } = useTheme()
  const { setTheme: setKitTheme } = useKitTheme()
  const { address, connector, isConnected } = useAccount()
  const { setOpenConnectModal } = useOpenConnectModal()
  const { setOpenWalletModal } = useOpenWalletModal()
  const { triggerCheckout } = useCheckoutModal()
  const { disconnect } = useDisconnect()
  const { data: walletClient } = useWalletClient()
  const { switchChain } = useSwitchChain()
  const storage = useStorage()

  const [isCheckoutInfoModalOpen, setIsCheckoutInfoModalOpen] = React.useState(false)

  const [checkoutOrderId, setCheckoutOrderId] = React.useState('')
  const [checkoutTokenContractAddress, setCheckoutTokenContractAddress] = React.useState('')
  const [checkoutTokenId, setCheckoutTokenId] = React.useState('')

  const connections = useConnections()

  const isWaasConnection = connections.find(c => c.connector.id.includes('waas')) !== undefined

  const isMobile = useMediaQuery('isMobile')

  const { data: txnData, sendTransaction, isPending: isPendingSendTxn, error } = useSendTransaction()
  const { data: txnData2, isPending: isPendingMintTxn, writeContract } = useWriteContract()

  const [isSigningMessage, setIsSigningMessage] = React.useState(false)
  const [isMessageValid, setIsMessageValid] = React.useState<boolean | undefined>()
  const [messageSig, setMessageSig] = React.useState<string | undefined>()

  const [lastTxnDataHash, setLastTxnDataHash] = React.useState<string | undefined>()
  const [lastTxnDataHash2, setLastTxnDataHash2] = React.useState<string | undefined>()

  const [confirmationEnabled, setConfirmationEnabled] = React.useState<boolean>(
    localStorage.getItem('confirmationEnabled') === 'true'
  )

  // const [pendingFeeOptionConfirmation, confirmPendingFeeOption, rejectPendingFeeOption] = useWaasFeeOptions()

  // const [selectedFeeOptionTokenName, setSelectedFeeOptionTokenName] = React.useState<string | undefined>()

  // useEffect(() => {
  //   if (pendingFeeOptionConfirmation) {
  //     setSelectedFeeOptionTokenName(pendingFeeOptionConfirmation.options[0].token.name)
  //   }
  // }, [pendingFeeOptionConfirmation])

  useEffect(() => {
    if (error?.message) {
      console.log(error?.message)
    }
  }, [error])

  const chainId = useChainId()

  // const indexerClient = useIndexerClient(chainId)

  // const [feeOptionBalances, setFeeOptionBalances] = React.useState<{ tokenName: string; decimals: number; balance: string }[]>([])

  // const [feeOptionAlert, setFeeOptionAlert] = React.useState<AlertProps | undefined>(undefined)

  // useEffect(() => {
  //   checkTokenBalancesForFeeOptions()
  // }, [pendingFeeOptionConfirmation])

  const handleSwitchConnectionMode = (mode: ConnectionMode) => {
    const searchParams = new URLSearchParams()

    searchParams.set('mode', mode)
    window.location.search = searchParams.toString()
  }

  // const checkTokenBalancesForFeeOptions = async () => {
  //   if (pendingFeeOptionConfirmation && walletClient) {
  //     const [account] = await walletClient.getAddresses()
  //     const nativeTokenBalance = await indexerClient.getEtherBalance({ accountAddress: account })

  //     const tokenBalances = await indexerClient.getTokenBalances({
  //       accountAddress: account
  //     })

  //     console.log('feeOptions', pendingFeeOptionConfirmation.options)
  //     console.log('nativeTokenBalance', nativeTokenBalance)
  //     console.log('tokenBalances', tokenBalances)

  //     const balances = pendingFeeOptionConfirmation.options.map(option => {
  //       if (option.token.contractAddress === null) {
  //         return {
  //           tokenName: option.token.name,
  //           decimals: option.token.decimals || 0,
  //           balance: nativeTokenBalance.balance.balanceWei
  //         }
  //       } else {
  //         return {
  //           tokenName: option.token.name,
  //           decimals: option.token.decimals || 0,
  //           balance:
  //             tokenBalances.balances.find(b => b.contractAddress.toLowerCase() === option.token.contractAddress?.toLowerCase())
  //               ?.balance || '0'
  //         }
  //       }
  //     })

  //     setFeeOptionBalances(balances)
  //   }
  // }

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
      console.error(e)
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
    const contractAbiInterface = new ethers.utils.Interface(['function demo()'])

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

  const onClickChangeTheme = () => {
    // Change theme at the app level
    setTheme(theme === 'dark' ? 'light' : 'dark')
    // Change the theme in kit. Theme can also be changed in the settings for kit only
    setKitTheme(theme === 'dark' ? 'light' : 'dark')
  }

  const HeaderContent = () => {
    if (!isConnected) {
      return (
        <Box padding="5" justifyContent="flex-end">
          <SwitchThemeButton />
        </Box>
      )
    }

    return (
      <Box padding="5" justifyContent="space-between">
        <Box flexDirection="row" alignItems="center" justifyContent="center" gap="3">
          <Image style={{ width: '36px' }} src="kit-logo.svg" />
          <Image
            style={{
              width: '24px',
              filter: theme === 'dark' ? 'invert(0)' : 'invert(1)'
            }}
            src="kit-logo-text.svg"
          />
        </Box>
        <Box>
          <Box flexDirection="column">
            <Box flexDirection="row" gap="2" justifyContent="flex-end" alignItems="center">
              <SwitchThemeButton />
              <Text fontWeight="medium" fontSize="normal" color="text100">
                {isMobile ? formatAddress(address || '') : address}
              </Text>
            </Box>
            <Box alignItems="center" justifyContent="flex-end" flexDirection="row">
              <Text fontWeight="medium" fontSize="normal" color="text50">
                {connector?.name}
              </Text>
            </Box>
          </Box>
        </Box>
      </Box>
    )
  }

  interface ClickableCardProps {
    title: string
    description: string
    disabled?: boolean
    isPending?: boolean
    onClick: () => void
  }

  const ClickableCard = ({ title, description, disabled, isPending, onClick }: ClickableCardProps) => {
    return (
      <Card
        style={{ width: '332px' }}
        clickable={!disabled}
        onClick={disabled ? () => {} : onClick}
        opacity={disabled ? '50' : '100'}
      >
        <Text color="text100" lineHeight="5" fontSize="normal" fontWeight="bold">
          {title}
        </Text>
        <Box marginTop="1">
          <Text fontWeight="medium" lineHeight="5" color="text50" fontSize="normal">
            {description}
          </Text>
        </Box>
        {isPending && <Spinner marginTop="3" size="sm" color="text100" />}
      </Card>
    )
  }

  const onClickConnect = () => {
    setOpenConnectModal(true)
  }

  // const onClickCheckout = () => {
  //   setIsCheckoutInfoModalOpen(true)
  // }

  const onCheckoutInfoConfirm = () => {
    setIsCheckoutInfoModalOpen(false)
    if (checkoutOrderId !== '' && checkoutTokenContractAddress !== '' && checkoutTokenId !== '') {
      const checkoutSettings = getCheckoutSettings(
        checkoutOrderId,
        address || '',
        checkoutTokenContractAddress,
        checkoutTokenId,
        137,
        1,
        true
      )
      triggerCheckout(checkoutSettings)
    }
  }

  const SwitchThemeButton = () => {
    return <IconButton onClick={onClickChangeTheme} icon={theme === 'dark' ? SunIcon : MoonIcon} />
  }

  const onSwitchNetwork = () => {
    if (chainId === 421614) {
      switchChain({ chainId: 42170 })
    } else {
      switchChain({ chainId: 421614 })
    }

    setLastTxnDataHash(undefined)
    setLastTxnDataHash2(undefined)
    setIsMessageValid(undefined)
  }

  return (
    <Box background="backgroundPrimary">
      {isDebugMode && (
        <Box justifyContent="center" alignItems="center">
          <Text>Debug mode</Text>
        </Box>
      )}
      <Box style={{ height: '72px' }} position="fixed" width="full" top="0">
        <HeaderContent />
      </Box>
      <Box
        style={isMobile ? { paddingTop: '85px', paddingBottom: '80px' } : { height: '100vh' }}
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
      >
        {isConnected ? (
          <Box flexDirection="column" gap="4">
            <Box flexDirection="column" gap="2">
              <Text color="text50" fontSize="small" fontWeight="medium">
                Demos
              </Text>
              {/* <ClickableCard
                title="NFT Checkout"
                description="NFT Checkout testing"
                onClick={onClickCheckout}
              /> */}
              <ClickableCard
                title="Inventory"
                description="Connect a Sequence wallet to view, swap, send, and receive collections"
                onClick={() => setOpenWalletModal(true)}
              />
              <ClickableCard
                title="Send transaction"
                description="Send a transaction with your wallet"
                isPending={isPendingSendTxn}
                onClick={runSendTransaction}
              />

              {networkForCurrentChainId.blockExplorer &&
                lastTxnDataHash &&
                ((txnData as any)?.chainId === chainId || txnData) && (
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
              <ClickableCard
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

              <ClickableCard
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
                <ClickableCard
                  title="Generate EthAuth proof"
                  description="Generate EthAuth proof"
                  onClick={generateEthAuthProof}
                />
              )}
              {/* <ClickableCard
                title="NFT Checkout"
                description="Set orderbook order id, token contract address and token id to test checkout (on Polygon)"
                onClick={onClickCheckout}
              /> */}
              <ClickableCard
                title="Switch network"
                description={`Current network: ${networkForCurrentChainId.title}`}
                onClick={onSwitchNetwork}
              />
            </Box>

            {/* {pendingFeeOptionConfirmation && feeOptionBalances.length > 0 && (
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
                        <Box alignItems="flex-start" flexDirection="column" fontSize="xsmall">
                          <Box flexDirection="row">
                            <Text>Fee (in {option.token.name}): </Text>{' '}
                            <Text>{formatUnits(BigInt(option.value), option.token.decimals || 0)}</Text>
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
            )} */}

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
            <Box width="full" gap="2" flexDirection="row" justifyContent="flex-end">
              <Button
                onClick={() => {
                  disconnect()
                  setLastTxnDataHash(undefined)
                  setLastTxnDataHash2(undefined)
                  setIsMessageValid(undefined)
                }}
                leftIcon={SignoutIcon}
                label="Sign out"
              />
            </Box>
          </Box>
        ) : (
          <Box>
            <Box flexDirection="column" alignItems="center" justifyContent="center" gap="5">
              <Box flexDirection="row" alignItems="center" justifyContent="center" gap="3">
                <Image style={{ width: '48px' }} src="kit-logo.svg" />
                <Image
                  style={{
                    width: '32px',
                    filter: theme === 'dark' ? 'invert(0)' : 'invert(1)'
                  }}
                  src="kit-logo-text.svg"
                />
              </Box>
              <Box gap="2" flexDirection="row" alignItems="center">
                <Button onClick={onClickConnect} variant="feature" label="Connect" />
              </Box>

              <Box gap="2" flexDirection="column" marginTop="10" width="1/2">
                <ConnectionModeSelect
                  mode="waas"
                  title="Embedded Wallet (WaaS)"
                  description="Connect to an embedded wallet for a seamless experience."
                  onClick={handleSwitchConnectionMode}
                />

                <ConnectionModeSelect
                  mode="universal"
                  title="Universal"
                  description="Connect to the universal sequence wallet or EIP6963 Injected wallet providers (web extension wallets)."
                  onClick={handleSwitchConnectionMode}
                />
              </Box>
            </Box>
          </Box>
        )}
      </Box>

      {!isMobile && <Footer />}

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
    </Box>
  )
}

interface ConnectionModeSelectProps {
  mode: ConnectionMode
  title: string
  description: string
  onClick: (mode: ConnectionMode) => void
}

const ConnectionModeSelect = (props: ConnectionModeSelectProps) => {
  const { mode, title, description, onClick } = props

  const isSelected = connectionMode === mode

  return (
    <Card
      clickable
      outlined
      borderWidth="thick"
      style={{
        boxShadow: isSelected ? '0 0 24px rgb(127 59 158 / 0.8)' : 'none',
        borderColor: isSelected ? 'rgb(127 59 200)' : 'var(--seq-colors-border-normal)'
      }}
      onClick={() => onClick(mode)}
    >
      <Box gap="2">
        <Box marginTop="1">
          <Text variant="normal" fontWeight="bold" color={isSelected ? 'text100' : 'text80'}>
            {title}
          </Text>
          <Text as="p" variant="normal" color="text50" marginTop="4">
            {description}
          </Text>
        </Box>
        <CheckmarkIcon size="md" style={{ color: 'rgb(127 59 200)' }} visibility={isSelected ? 'visible' : 'hidden'} />
      </Box>
    </Card>
  )
}
