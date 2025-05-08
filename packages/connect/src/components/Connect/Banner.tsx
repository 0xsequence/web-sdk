import { Image } from '@0xsequence/design-system'

import type { ConnectConfig } from '../../types.js'

interface BannerProps {
  config: ConnectConfig
}

export const Banner = ({ config = {} as ConnectConfig }: BannerProps) => {
  const { signIn = {} } = config
  const { logoUrl } = signIn

  return (
    <>
      {logoUrl && (
        <div className="flex mt-5 justify-center items-center">
          <Image src={logoUrl} style={{ height: '110px' }} />
        </div>
      )}
    </>
  )
}
