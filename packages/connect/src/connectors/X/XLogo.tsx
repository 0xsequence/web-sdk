import type { FunctionComponent } from 'react'

import type { LogoProps } from '../../types.js'

interface GetXLogo {
  isDarkMode: boolean
}

export const getXLogo = ({ isDarkMode }: GetXLogo) => {
  const fillColor = isDarkMode ? 'white' : 'black'

  const XLogo: FunctionComponent<LogoProps> = () => {
    return (
      <svg width="300" height="300" viewBox="0 0 300 300" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M178.57 127.044L290.27 0H263.81L166.78 110.288L89.34 0H0L117.13 166.791L0 300H26.46L128.86 183.507L210.66 300H300M36.01 19.5237H76.66L263.79 281.435H223.13"
          fill={fillColor}
        />
      </svg>
    )
  }

  return XLogo
}
