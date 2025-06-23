import type { CheckoutSettings } from '@0xsequence/checkout'
import {
  ContractVerificationStatus,
  signEthAuthProof,
  useOpenConnectModal,
  useSocialLink,
  useStorage,
  useWaasFeeOptions,
  useWallets,
  validateEthProof
} from '@0xsequence/connect'
import { Button, Card, cn, Select, Text } from '@0xsequence/design-system'
import { useIndexerClient } from '@0xsequence/hooks'
import { allNetworks, ChainId } from '@0xsequence/network'
import { useOpenWalletModal } from '@0xsequence/wallet-widget'
import { CardButton, Header, WalletListItem } from 'example-shared-components'
import { useEffect, useState, type ComponentProps } from 'react'
import { encodeFunctionData, formatUnits, parseAbi, parseUnits } from 'viem'
import { useAccount, useChainId, usePublicClient, useSendTransaction, useWalletClient, useWriteContract } from 'wagmi'

import { isDebugMode, sponsoredContractAddresses } from '../../config'

import { messageToSign } from '@/constants'
import { abi } from '@/constants/nft-abi'

export const Connected = () => {
  const { address } = useAccount()
  const { setOpenConnectModal } = useOpenConnectModal()
  const { setOpenWalletModal } = useOpenWalletModal()
  const { setIsSocialLinkOpen } = useSocialLink()

  const { data: walletClient } = useWalletClient()
  const storage = useStorage()

  const { wallets, setActiveWallet, disconnectWallet } = useWallets()

  const onClickConnect = () => {
    setOpenConnectModal(true)
  }

  const { data: txnData, sendTransaction, isPending: isPendingSendTxn, error: sendTransactionError } = useSendTransaction()
  const { data: txnData2, isPending: isPendingMintTxn, writeContract } = useWriteContract()
  const {
    data: txnData3,
    sendTransaction: sendUnsponsoredTransaction,
    isPending: isPendingSendUnsponsoredTxn,
    error: sendUnsponsoredTransactionError
  } = useSendTransaction()

  const [isSigningMessage, setIsSigningMessage] = useState(false)
  const [isMessageValid, setIsMessageValid] = useState<boolean | undefined>()
  const [messageSig, setMessageSig] = useState<string | undefined>()

  const [lastTxnDataHash, setLastTxnDataHash] = useState<string | undefined>()
  const [lastTxnDataHash2, setLastTxnDataHash2] = useState<string | undefined>()
  const [lastTxnDataHash3, setLastTxnDataHash3] = useState<string | undefined>()

  const [pendingFeeOptionConfirmation, confirmPendingFeeOption] = useWaasFeeOptions()

  const [selectedFeeOptionTokenName, setSelectedFeeOptionTokenName] = useState<string | undefined>()

  useEffect(() => {
    if (pendingFeeOptionConfirmation) {
      setSelectedFeeOptionTokenName(pendingFeeOptionConfirmation.options[0].token.name)
    }
  }, [pendingFeeOptionConfirmation])

  useEffect(() => {
    if (sendTransactionError) {
      if (sendTransactionError instanceof Error) {
        console.error(sendTransactionError.cause)
      } else {
        console.error(sendTransactionError)
      }
    }
    if (sendUnsponsoredTransactionError) {
      if (sendUnsponsoredTransactionError instanceof Error) {
        console.error(sendUnsponsoredTransactionError.cause)
      } else {
        console.error(sendUnsponsoredTransactionError)
      }
    }

    return
  }, [sendTransactionError, sendUnsponsoredTransactionError])

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
        }
        return {
          tokenName: option.token.name,
          decimals: option.token.decimals || 0,
          balance:
            tokenBalances.balances.find(b => b.contractAddress.toLowerCase() === option.token.contractAddress!.toLowerCase())
              ?.balance || '0'
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

      sendTransaction({ to: account, value: BigInt(0), gas: null })
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

  const onClickSocialLink = () => {
    setIsSocialLinkOpen(true)
  }

  useEffect(() => {
    setLastTxnDataHash(undefined)
    setLastTxnDataHash2(undefined)
    setLastTxnDataHash3(undefined)
    setIsMessageValid(undefined)
  }, [chainId])

  return (
    <>
      <Header />
      <div className="flex px-4 flex-col justify-center items-center" style={{ margin: '140px 0' }}>
        <div className="flex flex-col gap-4">
          <div className="flex my-3 flex-col gap-2">
            <Text fontWeight="semibold" variant="small" color="muted">
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

          <div className="flex flex-col gap-2">
            <Text variant="small" color="muted" fontWeight="medium">
              Demos
            </Text>
            <CardButton title="Inventory" description="View all tokens in your wallet" onClick={() => setOpenWalletModal(true)} />
            {/* <CardButton
              title="Checkout"
              description="Checkout screen before placing a purchase on coins or collections"
              onClick={onClickCheckout}
            /> */}
            {(sponsoredContractAddresses[chainId] || networkForCurrentChainId.testnet) && (
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

            {networkForCurrentChainId.testnet && (
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
              title="Mint an NFT"
              description="Test minting an NFT to your wallet"
              isPending={isPendingMintTxn}
              onClick={runMintNFT}
            />

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

            {isDebugMode && (
              <CardButton title="Generate EthAuth proof" description="Generate EthAuth proof" onClick={generateEthAuthProof} />
            )}

            <CardButton title="Social Link" description="Open the social link modal" onClick={() => onClickSocialLink()} />
          </div>

          {pendingFeeOptionConfirmation && feeOptionBalances.length > 0 && (
            <div className="my-3">
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
                options={
                  pendingFeeOptionConfirmation?.options?.map(option => ({
                    label: (
                      <div className="flex items-start flex-col">
                        <div className="flex flex-row">
                          <Text variant="xsmall">Fee (in {option.token.name}): </Text>{' '}
                          <Text variant="xsmall">{formatUnits(BigInt(option.value), option.token.decimals || 0)}</Text>
                        </div>
                        <div className="flex flex-row">
                          <Text>Wallet balance for {option.token.name}: </Text>{' '}
                          <Text>
                            {formatUnits(
                              BigInt(feeOptionBalances.find(b => b.tokenName === option.token.name)?.balance || '0'),
                              option.token.decimals || 0
                            )}
                          </Text>
                        </div>
                      </div>
                    ),
                    value: option.token.name
                  })) || []
                }
              />

              <div className="flex my-2 items-center justify-center flex-col">
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
        </div>
      </div>
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
