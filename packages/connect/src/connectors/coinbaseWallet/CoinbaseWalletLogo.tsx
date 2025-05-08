import type { FunctionComponent } from 'react'

import type { LogoProps } from '../../types.js'

export const CoinbaseWalletLogo: FunctionComponent<LogoProps> = props => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" fill="none" {...props}>
      <rect width="100%" height="100%" fill="#0052FF" rx="100" />
      <path
        fill="#fff"
        fillRule="evenodd"
        d="M152 512c0 198.823 161.177 360 360 360s360-161.177 360-360-161.177-360-360-360-360 161.177-360 360Zm268-116c-13.255 0-24 10.745-24 24v184c0 13.255 10.745 24 24 24h184c13.255 0 24-10.745 24-24V420c0-13.255-10.745-24-24-24H420Z"
        clipRule="evenodd"
      />
    </svg>
  )
}
