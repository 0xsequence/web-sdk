import { useWallets } from '@0xsequence/connect'
import { Button, CopyIcon, ShareIcon, Text } from '@0xsequence/design-system'
import { useClipboard } from '@0xsequence/hooks'
import { QRCodeCanvas } from 'qrcode.react'
import { useAccount } from 'wagmi'

import { WalletSelect } from '../../components/Select/WalletSelect.js'

export const Receive = () => {
  const { address } = useAccount()
  const { setActiveWallet } = useWallets()
  const [isCopied, setCopied] = useClipboard({ timeout: 4000 })

  const onClickWallet = (address: string) => {
    setActiveWallet(address)
  }

  const onClickShare = () => {
    if (typeof window !== 'undefined') {
      window.open(`https://twitter.com/intent/tweet?text=Here%20is%20my%20address%20${address}`)
    }
  }

  return (
    <div className="flex flex-col justify-center items-center px-4 pb-6 gap-4">
      <WalletSelect selectedWallet={address || ''} onClick={onClickWallet} />
      <div className="flex mt-1 w-fit bg-white rounded-xl items-center justify-center p-4">
        <QRCodeCanvas value={address || ''} size={200} bgColor="white" fgColor="black" data-id="receiveQR" />
      </div>
      <div>
        <div className="flex flex-row items-center justify-center gap-2">
          <Text className="text-center leading-[inherit]" variant="medium" color="primary" style={{ fontWeight: '700' }}>
            My Wallet
          </Text>
        </div>
        <div className="mt-2" style={{ maxWidth: '180px', textAlign: 'center' }}>
          <Text
            className="text-center"
            color="muted"
            style={{
              fontSize: '14px',
              maxWidth: '180px',
              overflowWrap: 'anywhere'
            }}
          >
            {address}
          </Text>
        </div>
      </div>
      <div className="flex gap-3">
        <Button onClick={() => setCopied(address || '')} leftIcon={CopyIcon} label={isCopied ? 'Copied!' : 'Copy'} />
        <Button onClick={onClickShare} leftIcon={ShareIcon} label="Share" />
      </div>
    </div>
  )
}
