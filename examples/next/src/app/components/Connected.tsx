import { Box, Text, Card, Button, Select } from '@0xsequence/design-system'
import { signEthAuthProof, useIndexerClient, useStorage, useWaasFeeOptions, validateEthProof } from '@0xsequence/kit'
import { CheckoutSettings } from '@0xsequence/kit-checkout'
import { CardButton, Header } from '@0xsequence/kit-example-shared-components'
import { useOpenWalletModal } from '@0xsequence/kit-wallet'
import { ChainId, allNetworks } from '@0xsequence/network'
import { ComponentProps, useEffect, useState } from 'react'
import { formatUnits, parseUnits } from 'viem'
import { useAccount, useChainId, usePublicClient, useSendTransaction, useWalletClient, useWriteContract } from 'wagmi'

import { isDebugMode } from '../../config'

import { messageToSign } from '@/constants'
import { abi } from '@/constants/nft-abi'

export const Connected = () => {
  const { address } = useAccount()
  const { setOpenWalletModal } = useOpenWalletModal()
  // const { setOpenConnectModal } = useOpenConnectModal()
  // const { triggerCheckout } = useCheckoutModal()
  const { data: walletClient } = useWalletClient()
  const storage = useStorage()

  const { data: txnData, sendTransaction, isPending: isPendingSendTxn, error } = useSendTransaction()
  const { data: txnData2, isPending: isPendingMintTxn, writeContract } = useWriteContract()

  const [isSigningMessage, setIsSigningMessage] = useState(false)
  const [isMessageValid, setIsMessageValid] = useState<boolean | undefined>()
  const [messageSig, setMessageSig] = useState<string | undefined>()

  const [lastTxnDataHash, setLastTxnDataHash] = useState<string | undefined>()
  const [lastTxnDataHash2, setLastTxnDataHash2] = useState<string | undefined>()

  const [pendingFeeOptionConfirmation, confirmPendingFeeOption] = useWaasFeeOptions()

  const [selectedFeeOptionTokenName, setSelectedFeeOptionTokenName] = useState<string | undefined>()

  useEffect(() => {
    if (pendingFeeOptionConfirmation) {
      setSelectedFeeOptionTokenName(pendingFeeOptionConfirmation.options[0].token.name)
    }
  }, [pendingFeeOptionConfirmation])

  useEffect(() => {
    console.log(error?.message)
  }, [error])

  const chainId = useChainId()

  const indexerClient = useIndexerClient(chainId)

  const [feeOptionBalances, setFeeOptionBalances] = useState<{ tokenName: string; decimals: number; balance: string }[]>([])

  const [feeOptionAlert, setFeeOptionAlert] = useState<AlertProps | undefined>(undefined)

  useEffect(() => {
    if (pendingFeeOptionConfirmation) {
      checkTokenBalancesForFeeOptions()
    }
  }, [pendingFeeOptionConfirmation])

  const checkTokenBalancesForFeeOptions = async () => {
    if (pendingFeeOptionConfirmation) {
      const [account] = await walletClient!.getAddresses()
      const nativeTokenBalance = await indexerClient.getEtherBalance({ accountAddress: account })

      const tokenBalances = await indexerClient.getTokenBalances({
        accountAddress: account
      })

      console.log('feeOptions', pendingFeeOptionConfirmation.options)
      console.log('nativeTokenBalance', nativeTokenBalance)
      console.log('tokenBalances', tokenBalances)

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
              tokenBalances.balances.find(b => b.contractAddress.toLowerCase() === option.token.contractAddress!.toLowerCase())
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
      console.error(e)
    }
  }

  const runSendTransaction = async () => {
    if (!walletClient) {
      return
    }

    const [account] = await walletClient.getAddresses()

    sendTransaction({ to: account, value: BigInt(0), gas: null })
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

  // const onClickConnect = () => {
  //   setOpenConnectModal(true)
  // }

  // const onClickCheckout = () => {
  //   triggerCheckout(getCheckoutSettings(address))
  // }

  useEffect(() => {
    setLastTxnDataHash(undefined)
    setLastTxnDataHash2(undefined)
    setIsMessageValid(undefined)
  }, [chainId])

  return (
    <>
      <Header />

      <Box paddingX="4" flexDirection="column" justifyContent="center" alignItems="center" style={{ margin: '140px 0' }}>
        <Box flexDirection="column" gap="4">
          <Box flexDirection="column" gap="2">
            <Text variant="small" color="text50" fontWeight="medium">
              Demos
            </Text>
            <CardButton
              title="Inventory"
              description="Connect a Sequence wallet to view, swap, send, and receive collections"
              onClick={() => setOpenWalletModal(true)}
            />
            {/* <CardButton
                title="Checkout"
                description="Checkout screen before placing a purchase on coins or collections"
                onClick={onClickCheckout}
              /> */}
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
              <CardButton title="Generate EthAuth proof" description="Generate EthAuth proof" onClick={generateEthAuthProof} />
            )}
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
        </Box>
      </Box>
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

export const getCheckoutSettings = (_address?: string) => {
  const checkoutSettings: CheckoutSettings = {
    cryptoCheckout: {
      chainId: ChainId.POLYGON,
      triggerTransaction: async () => {
        console.log('triggered transaction')
      },
      coinQuantity: {
        contractAddress: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
        amountRequiredRaw: '10000000000'
      }
    },
    orderSummaryItems: [
      {
        chainId: ChainId.POLYGON,
        contractAddress: '0x631998e91476da5b870d741192fc5cbc55f5a52e',
        tokenId: '66597',
        quantityRaw: '100'
      },
      {
        chainId: ChainId.POLYGON,
        contractAddress: '0x624e4fa6980afcf8ea27bfe08e2fb5979b64df1c',
        tokenId: '1741',
        quantityRaw: '100'
      }
    ]
  }

  return checkoutSettings
}
