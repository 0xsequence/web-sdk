import { Image } from '@0xsequence/design-system'

import { KitConfig } from '../../types'

interface BannerProps {
  config: KitConfig
}

export const Banner = ({ config = {} as KitConfig }: BannerProps) => {
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
