import type { FunctionComponent } from 'react'

import type { LogoProps } from '../../types.js'

interface GetMonochromeEpicLogoProps {
  isDarkMode?: boolean
}

export const EpicLogo: FunctionComponent<LogoProps> = props => (
  <svg width="38" height="38" viewBox="0 0 38 38" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <rect width="38" height="38" rx="6" fill="#121416" />
    <path d="M12.5 17H15.5V19H12.5V17Z" fill="white" />
    <path d="M16.5 17H19.5V19H16.5V17Z" fill="white" />
    <path d="M20.5 17H23.5V19H20.5V17Z" fill="white" />
    <path d="M24.5 17H27.5V19H24.5V17Z" fill="white" />
    <path d="M12.5 20H15.5V22H12.5V20Z" fill="white" />
    <path d="M16.5 20H19.5V22H16.5V20Z" fill="white" />
    <path d="M20.5 20H23.5V22H20.5V20Z" fill="white" />
    <path d="M24.5 20H27.5V22H24.5V20Z" fill="white" />
    <path d="M12.5 23H15.5V25H12.5V23Z" fill="white" />
    <path d="M16.5 23H19.5V25H16.5V23Z" fill="white" />
    <path d="M20.5 23H23.5V25H20.5V23Z" fill="white" />
    <path d="M24.5 23H27.5V25H24.5V23Z" fill="white" />
  </svg>
)

export const getMonochromeEpicLogo = ({ isDarkMode }: GetMonochromeEpicLogoProps = {}): FunctionComponent<LogoProps> => {
  const fillColor = isDarkMode ? 'white' : 'black'

  const MonochromeEpicLogo: FunctionComponent<LogoProps> = props => (
    <svg width="38" height="38" viewBox="0 0 38 38" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <rect width="38" height="38" rx="6" fill={fillColor} />
      <path d="M12.5 17H15.5V19H12.5V17Z" fill={isDarkMode ? 'black' : 'white'} />
      <path d="M16.5 17H19.5V19H16.5V17Z" fill={isDarkMode ? 'black' : 'white'} />
      <path d="M20.5 17H23.5V19H20.5V17Z" fill={isDarkMode ? 'black' : 'white'} />
      <path d="M24.5 17H27.5V19H24.5V17Z" fill={isDarkMode ? 'black' : 'white'} />
      <path d="M12.5 20H15.5V22H12.5V20Z" fill={isDarkMode ? 'black' : 'white'} />
      <path d="M16.5 20H19.5V22H16.5V20Z" fill={isDarkMode ? 'black' : 'white'} />
      <path d="M20.5 20H23.5V22H20.5V20Z" fill={isDarkMode ? 'black' : 'white'} />
      <path d="M24.5 20H27.5V22H24.5V20Z" fill={isDarkMode ? 'black' : 'white'} />
      <path d="M12.5 23H15.5V25H12.5V23Z" fill={isDarkMode ? 'black' : 'white'} />
      <path d="M16.5 23H19.5V25H16.5V23Z" fill={isDarkMode ? 'black' : 'white'} />
      <path d="M20.5 23H23.5V25H20.5V23Z" fill={isDarkMode ? 'black' : 'white'} />
      <path d="M24.5 23H27.5V25H24.5V23Z" fill={isDarkMode ? 'black' : 'white'} />
    </svg>
  )

  return MonochromeEpicLogo
}
