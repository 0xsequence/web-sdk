import { useOpenConnectModal, useWallets } from '@0xsequence/connect'
import { Button, Collapsible, Image, MoonIcon, SunIcon, Text, TextInput, useTheme } from '@0xsequence/design-system'
import { Footer } from 'example-shared-components'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

import { DEFAULT_WALLET_URL, sanitizeWalletUrl } from '../config'

import { Connected } from './Connected'

type HomepageProps = {
  walletUrl: string
  onWalletUrlChange: (walletUrl: string) => void
}

export const Homepage = ({ walletUrl, onWalletUrlChange }: HomepageProps) => {
  const { theme, setTheme } = useTheme()
  const { wallets } = useWallets()
  const { setOpenConnectModal } = useOpenConnectModal()
  const [walletUrlInput, setWalletUrlInput] = useState(walletUrl)

  const normalizedTheme: 'light' | 'dark' = theme === 'light' ? 'light' : 'dark'

  const onClickConnect = () => {
    setOpenConnectModal(true)
  }

  useEffect(() => {
    setWalletUrlInput(walletUrl)
  }, [walletUrl])

  const normalizedInput = sanitizeWalletUrl(walletUrlInput)
  const isDirty = normalizedInput !== walletUrl

  console.log('wallets.lenght', wallets.length)
  console.log('wallets', wallets)

  return (
    <main>
      {wallets.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-5 h-screen relative">
          <div className="absolute top-4 right-4">
            <Button onClick={() => setTheme(normalizedTheme === 'dark' ? 'light' : 'dark')} variant="ghost" size="sm">
              {normalizedTheme === 'dark' ? <SunIcon /> : <MoonIcon />}
            </Button>
          </div>

          <div className="flex flex-row items-center justify-center gap-3">
            <Image
              className="w-[300px]"
              src={theme === 'dark' ? 'images/sequence-websdk-dark.svg' : 'images/sequence-websdk-light.svg'}
            />
          </div>

          <div className="flex flex-col gap-3 items-center">
            <div className="flex gap-2 flex-row items-center">
              <Button onClick={onClickConnect} variant="primary">
                Connect
              </Button>
              <Link to="/inline">
                <Button variant="primary">Inline Demo</Button>
              </Link>
            </div>

            <div className="w-[400px] mt-10">
              <Collapsible
                label="Config"
                defaultOpen={false}
                className="w-full bg-background-raised border border-solid border-border-muted rounded-2xl"
              >
                <div className="flex flex-col gap-3 pt-0" style={{ lineHeight: 1.5 }}>
                  <div className="flex flex-col gap-1">
                    <Text variant="normal" color="secondary">
                      Wallet URL
                    </Text>
                    <Text variant="small" color="muted">
                      Override the wallet URL used by this demo. Saved locally so it sticks between reloads.
                    </Text>
                  </div>
                  <div className="flex flex-col gap-2">
                    <TextInput
                      name="wallet-url"
                      value={walletUrlInput}
                      onChange={e => setWalletUrlInput(e.target.value)}
                      placeholder="https://v3.sequence-dev.app"
                    />
                    <div className="flex flex-col gap-2">
                      <Text variant="small" color="muted">
                        Current: {walletUrl}
                      </Text>
                      <div className="flex gap-2 items-center">
                        <Button
                          variant="ghost"
                          onClick={() => {
                            setWalletUrlInput(DEFAULT_WALLET_URL)
                            onWalletUrlChange(DEFAULT_WALLET_URL)
                          }}
                        >
                          Reset
                        </Button>
                        <Button variant="primary" disabled={!isDirty} onClick={() => onWalletUrlChange(normalizedInput)}>
                          {isDirty ? 'Save' : 'Saved'}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </Collapsible>
            </div>
          </div>
        </div>
      ) : (
        <Connected />
      )}
      <Footer />
    </main>
  )
}
