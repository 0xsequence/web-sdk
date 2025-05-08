import { Skeleton } from '@0xsequence/design-system'
import { QRCodeCanvas } from 'qrcode.react'

import { CopyButton } from '../../components/CopyButton'

interface QRCodeProps {
  value: string | undefined
}

export const QRCode = (props: QRCodeProps) => {
  const { value } = props

  return (
    <div className="flex items-center flex-col gap-4">
      {value ? (
        <div className="bg-white p-4 rounded-lg" style={{ width: 232, height: 232 }}>
          <QRCodeCanvas value={value} size={200} bgColor="white" fgColor="black" data-id="qr-code" />
        </div>
      ) : (
        <Skeleton style={{ width: 232, height: 232 }} />
      )}
      <CopyButton text={value || ''} disabled={!value} />
    </div>
  )
}
