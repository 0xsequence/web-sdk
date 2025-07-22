import type { FunctionComponent } from 'react'

import type { LogoProps } from '../../types.js'

interface GetXLogo {
  isDarkMode: boolean
}

export const getXLogo = ({ isDarkMode }: GetXLogo) => {
  const fillColor = isDarkMode ? 'white' : 'black'

  const XLogo: FunctionComponent<LogoProps> = props => {
    return (
      <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
        <path
          d="M18.2856 14.16352L27.2216 4H25.1048L17.3424 12.82304L11.1472 4H4L13.3704 17.34328L4 28H6.1168L14.3088 18.68056L20.8528 28H28M6.8808 5.561896H10.1328L25.1032 26.5148H21.8504"
          fill={fillColor}
        />
      </svg>
    )
  }

  return XLogo
}
