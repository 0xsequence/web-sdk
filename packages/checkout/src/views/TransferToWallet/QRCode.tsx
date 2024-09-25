import { Box, Skeleton } from '@0xsequence/design-system'
import { QRCodeCanvas } from 'qrcode.react'

import { CopyButton } from './CopyButton'

interface QRCodeProps {
  value: string | undefined
}

export const QRCode = (props: QRCodeProps) => {
  const { value } = props

  return (
    <Box alignItems="center" flexDirection="column" gap="4">
      {value ? (
        <Box background="white" padding="4" borderRadius="sm" style={{ width: 232, height: 232 }}>
          <QRCodeCanvas value={value} size={200} bgColor="white" fgColor="black" data-id="qr-code" />
        </Box>
      ) : (
        <Skeleton style={{ width: 232, height: 232 }} />
      )}
      <CopyButton text={value || ''} disabled={!value} />
    </Box>
  )
}
