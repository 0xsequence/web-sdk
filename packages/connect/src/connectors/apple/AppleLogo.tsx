import React from 'react'

import type { LogoProps } from '../../types.js'

interface GetAppleLogo {
  isDarkMode: boolean
}

export const getAppleLogo = ({ isDarkMode }: GetAppleLogo) => {
  const fillColor = isDarkMode ? 'white' : 'black'

  const AppleLogo: React.FunctionComponent = (props: LogoProps) => {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 41.5 51" fill="none" {...props}>
        <path
          d="M40.2 17.4C36.8 19.5 34.7 23.1 34.7 27.1C34.7 31.6 37.4 35.7 41.5 37.4C40.7 40 39.5 42.4 38 44.6C35.8 47.7 33.5 50.9 30.1 50.9C26.7 50.9 25.7 48.9 21.7 48.9C17.8 48.9 16.4 51 13.2 51C10 51 8.4 48.1 5.9 44.5C2 39.5 0.1 33.7 0 27.6C0 17.7 6.4 12.4 12.8 12.4C16.2 12.4 19 14.6 21.1 14.6C23.1 14.6 26.3 12.3 30.1 12.3C34.1 12.2 37.9 14.1 40.2 17.4ZM28.3 8.1C30 6.1 30.9 3.6 31 1C31 0.7 31 0.3 30.9 0C28 0.3 25.3 1.7 23.4 3.9C21.7 5.8 20.7 8.2 20.6 10.8C20.6 11.1 20.6 11.4 20.7 11.7C20.9 11.7 21.2 11.8 21.4 11.8C24.1 11.6 26.6 10.2 28.3 8.1Z"
          fill={fillColor}
        />
      </svg>
    )
  }
  return AppleLogo
}

interface GetAppleMonochromeLogo {
  isDarkMode: boolean
}

export const getMonochromeAppleLogo = ({ isDarkMode }: GetAppleMonochromeLogo) => {
  const fillColor = isDarkMode ? '#FFFFFF' : '#000000'

  const AppleOtcLogo: React.FunctionComponent = (props: LogoProps) => {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 41.5 51" fill="none" {...props}>
        <path
          d="M40.2 17.4C36.8 19.5 34.7 23.1 34.7 27.1C34.7 31.6 37.4 35.7 41.5 37.4C40.7 40 39.5 42.4 38 44.6C35.8 47.7 33.5 50.9 30.1 50.9C26.7 50.9 25.7 48.9 21.7 48.9C17.8 48.9 16.4 51 13.2 51C10 51 8.4 48.1 5.9 44.5C2 39.5 0.1 33.7 0 27.6C0 17.7 6.4 12.4 12.8 12.4C16.2 12.4 19 14.6 21.1 14.6C23.1 14.6 26.3 12.3 30.1 12.3C34.1 12.2 37.9 14.1 40.2 17.4ZM28.3 8.1C30 6.1 30.9 3.6 31 1C31 0.7 31 0.3 30.9 0C28 0.3 25.3 1.7 23.4 3.9C21.7 5.8 20.7 8.2 20.6 10.8C20.6 11.1 20.6 11.4 20.7 11.7C20.9 11.7 21.2 11.8 21.4 11.8C24.1 11.6 26.6 10.2 28.3 8.1Z"
          fill={fillColor}
        />
      </svg>
    )
  }

  return AppleOtcLogo
}
