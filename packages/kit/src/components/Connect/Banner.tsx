import { KitConfig } from '../../types'

import { Box, Image } from '@0xsequence/design-system'

interface BannerProps {
  config: KitConfig
}

export const Banner = ({ config = {} as KitConfig }: BannerProps) => {
  const { signIn = {} } = config
  const { logoUrl } = signIn

  return (
    <>
      {logoUrl && (
        <Box marginTop="5" justifyContent="center" alignItems="center">
          <Image src={logoUrl} style={{ height: '110px' }} />
        </Box>
      )}
    </>
  )
}
