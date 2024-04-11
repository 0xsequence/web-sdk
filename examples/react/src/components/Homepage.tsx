import React from 'react'
import qs from 'query-string'
import { useOpenConnectModal, signEthAuthProof, validateEthProof, useTheme as useKitTheme } from '@0xsequence/kit'
import { useOpenWalletModal } from '@0xsequence/kit-wallet'
import { useCheckoutModal } from '@0xsequence/kit-checkout'
import { useDisconnect, useAccount, useWalletClient, usePublicClient, useChainId, useSwitchChain } from 'wagmi'
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
  vars,
  IconButton
} from '@0xsequence/design-system'

import { Footer } from './Footer'
import { messageToSign } from '../constants'
import { formatAddress, getCheckoutSettings } from '../utils'

function Homepage() {
  const { theme, setTheme } = useTheme()
  const { setTheme: setKitTheme } = useKitTheme()
  const { address, connector, isConnected } = useAccount()
  const { setOpenConnectModal } = useOpenConnectModal()
  const { setOpenWalletModal } = useOpenWalletModal()
  const { triggerCheckout } = useCheckoutModal()
  const { disconnect } = useDisconnect()
  const { data: walletClient } = useWalletClient()
  const { switchChain } = useSwitchChain()

  const chainId = useChainId()

  const publicClient = usePublicClient()

  // append ?debug=true to url to enable debug mode
  const { debug } = qs.parse(location.search)
  const isDebugMode = debug === 'true'

  const generateEthAuthProof = async () => {
    if (!walletClient || !publicClient) {
      return
    }

    try {
      const proof = await signEthAuthProof(walletClient)
      console.log('proof:', proof)

      const isValid = await validateEthProof(walletClient, publicClient, proof)
      console.log('isValid?:', isValid)
    } catch (e) {
      console.error(e)
    }
  }

  const signMessage = async () => {
    if (!walletClient) {
      return
    }

    try {
      const message = messageToSign

      // sign
      const sig = await walletClient.signMessage({
        account: address || ('' as `0x${string}`),
        message
      })
      console.log('signature:', sig)

      const [account] = await walletClient.getAddresses()

      const isValid = await publicClient.verifyMessage({
        address: account,
        message,
        signature: sig
      })

      console.log('isValid?', isValid)
    } catch (e) {
      console.error(e)
    }
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
                {formatAddress(address || '')}
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
    onClick: () => void
  }

  const ClickableCard = ({ title, description, onClick }: ClickableCardProps) => {
    return (
      <Card style={{ width: '332px' }} clickable onClick={onClick}>
        <Text color="text100" lineHeight="5" fontSize="normal" fontWeight="bold">
          {title}
        </Text>
        <Box marginTop="1">
          <Text fontWeight="medium" lineHeight="5" color="text50" fontSize="normal">
            {description}
          </Text>
        </Box>
      </Card>
    )
  }

  const onClickConnect = () => {
    setOpenConnectModal(true)
  }

  const onClickCheckout = () => {
    triggerCheckout(getCheckoutSettings(address))
  }

  const SwitchThemeButton = () => {
    return <IconButton onClick={onClickChangeTheme} icon={theme === 'dark' ? SunIcon : MoonIcon} />
  }

  const onSwitchNetwork = () => {
    if (chainId === 1) {
      switchChain({ chainId: 137 })
    } else {
      switchChain({ chainId: 1 })
    }
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
      <Box style={{ height: '100vh' }} flexDirection="column" justifyContent="center" alignItems="center">
        {isConnected ? (
          <Box flexDirection="column" gap="4">
            <Box flexDirection="column" gap="2">
              <Text color="text50" fontSize="small" fontWeight="medium">
                Demos
              </Text>
              <ClickableCard
                title="Embedded wallet"
                description="Connect a Sequence wallet to view, swap, send, and receive collections"
                onClick={() => setOpenWalletModal(true)}
              />
              <ClickableCard
                title="Checkout"
                description="Checkout screen before placing a purchase on coins or collections"
                onClick={onClickCheckout}
              />
              <ClickableCard title="Sign message" description="Sign a message with your wallet" onClick={signMessage} />
              {isDebugMode && (
                <ClickableCard
                  title="Generate EthAuth proof"
                  description="Generate EthAuth proof"
                  onClick={generateEthAuthProof}
                />
              )}
              {isDebugMode && <ClickableCard title="Switch network" description="Switch network" onClick={onSwitchNetwork} />}
            </Box>
            <Box width="full" gap="2" flexDirection="row" justifyContent="flex-end">
              <Button onClick={() => disconnect()} leftIcon={SignoutIcon} label="Sign out" />
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
            </Box>
          </Box>
        )}
      </Box>
      <Footer />
    </Box>
  )
}

export default Homepage
