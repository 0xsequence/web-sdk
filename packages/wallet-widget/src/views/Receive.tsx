import { getNetwork } from '@0xsequence/connect'
import { Button, CopyIcon, Image, ShareIcon, Text } from '@0xsequence/design-system'
import { useClipboard } from '@0xsequence/hooks'
import { QRCodeCanvas } from 'qrcode.react'
import { useAccount } from 'wagmi'

import { NetworkSelect } from '../components/Select/NetworkSelect'
import { HEADER_HEIGHT_WITH_LABEL } from '../constants'

const isVowel = (char: string) => ['a', 'e', 'i', 'o', 'u'].includes(char.toLowerCase())

export const Receive = () => {
  const { address, chain } = useAccount()
  const [isCopied, setCopied] = useClipboard({ timeout: 4000 })

  const networkInfo = getNetwork(chain?.id || 1)
  const networkName = networkInfo.title || networkInfo.name

  const onClickShare = () => {
    if (typeof window !== 'undefined') {
      window.open(`https://twitter.com/intent/tweet?text=Here%20is%20my%20address%20${address}`)
    }
  }

  return (
    <div style={{ paddingTop: HEADER_HEIGHT_WITH_LABEL }}>
      <div className="flex flex-col justify-center items-center px-4 pb-6 gap-4">
        <NetworkSelect />
        <div className="flex mt-1 w-fit bg-white rounded-xl items-center justify-center p-4">
          <QRCodeCanvas value={address || ''} size={200} bgColor="white" fgColor="black" data-id="receiveQR" />
        </div>
        <div>
          <div className="flex flex-row items-center justify-center gap-2">
            <Text className="text-center leading-[inherit]" variant="medium" color="primary" style={{ fontWeight: '700' }}>
              My Wallet
            </Text>
            <Image className="w-5 rounded-xs" src={networkInfo.logoURI} alt="icon" />
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
        <div className="flex justify-center items-center" style={{ maxWidth: '260px', textAlign: 'center' }}>
          <Text
            color="primary"
            variant="small"
            style={{
              maxWidth: '260px',
              overflowWrap: 'anywhere'
            }}
          >
            {`This is a${isVowel(networkName[0]) ? 'n' : ''} ${networkName} address. Please only send assets on the ${networkName} network.`}
          </Text>
        </div>
      </div>
    </div>
  )
}
