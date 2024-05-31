import React from 'react'

import { LogoProps } from '../../types'

export const FacebookLogo: React.FunctionComponent = (props: LogoProps) => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 41 40" fill="none" {...props}>
      <path
        d="M17.4214 36.9716C9.27855 35.5145 3.10712 28.4859 3.10712 20.0001C3.10712 10.5715 10.8214 2.85718 20.25 2.85718C29.6785 2.85718 37.3928 10.5715 37.3928 20.0001C37.3928 28.4859 31.2214 35.5145 23.0785 36.9716L22.1357 36.2002H18.3643L17.4214 36.9716Z"
        fill="url(#paint0_linear_193_14528)"
      />
      <path
        d="M26.9357 24.7999L27.7072 19.9999H23.1643V16.657C23.1643 15.2856 23.6786 14.257 25.7357 14.257H27.9643V9.88558C26.7643 9.71415 25.3929 9.54272 24.1929 9.54272C20.25 9.54272 17.5071 11.9427 17.5071 16.2285V19.9999H13.2214V24.7999H17.5071V36.8857C18.45 37.0571 19.3929 37.1429 20.3357 37.1429C21.2786 37.1429 22.2214 37.0571 23.1643 36.8857V24.7999H26.9357Z"
        fill="white"
      />
      <defs>
        <linearGradient
          id="paint0_linear_193_14528"
          x1="20.2508"
          y1="35.9507"
          x2="20.2508"
          y2="2.85086"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#0062E0" />
          <stop offset="1" stopColor="#19AFFF" />
        </linearGradient>
      </defs>
    </svg>
  )
}

interface GetFacebookMonochromeLogo {
  isDarkMode: boolean
}

export const getFacebookMonochromeLogo = ({ isDarkMode }: GetFacebookMonochromeLogo) => {
  const fillColor = isDarkMode ? '#FFFFFF' : '#000000'

  const FacebookMonochromeLogo: React.FunctionComponent = (props: LogoProps) => {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 41 40" fill="none" {...props}>
        <path
          d="M25.8582 10.4398C24.1222 10.4398 23.6288 11.2098 23.6288 12.9073V15.709H28.246L27.791 20.2476H23.6279V34H18.1024V20.2468H14.375V15.7081H18.1042V12.9851C18.1042 8.40625 19.9399 6 25.0891 6C26.1942 6 27.5163 6.0875 28.3055 6.19775V10.459"
          fill={fillColor}
        />
      </svg>
    )
  }

  return FacebookMonochromeLogo
}
