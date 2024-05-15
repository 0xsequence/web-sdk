import React from 'react'

import { LogoProps } from '../../types'

export const GoogleLogo: React.FunctionComponent = (props: LogoProps) => {
  return (
    <svg viewBox="0 0 41 40" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <g id="Frame 2114">
        <g id="Group">
          <path
            id="Vector"
            d="M20.7497 16.8828V23.5218H29.9756C29.5705 25.6568 28.3548 27.4647 26.5314 28.6803L32.095 32.9972C35.3366 30.0051 37.2068 25.6102 37.2068 20.3895C37.2068 19.1739 37.0977 18.005 36.895 16.883L20.7497 16.8828Z"
            fill="#4285F4"
          />
          <path
            id="Vector_2"
            d="M11.1424 23.2627L9.88756 24.2232L5.44592 27.6829C8.2667 33.2777 14.0481 37.1427 20.7493 37.1427C25.3778 37.1427 29.2583 35.6154 32.0947 32.9973L26.5311 28.6803C25.0038 29.7089 23.0557 30.3324 20.7493 30.3324C16.2922 30.3324 12.5053 27.3246 11.1494 23.2726L11.1424 23.2627Z"
            fill="#34A853"
          />
          <path
            id="Vector_3"
            d="M5.44594 12.3169C4.27718 14.6233 3.60712 17.2259 3.60712 19.9999C3.60712 22.7739 4.27718 25.3765 5.44594 27.6829C5.44594 27.6984 11.1499 23.2569 11.1499 23.2569C10.8071 22.2284 10.6044 21.1375 10.6044 19.9997C10.6044 18.8619 10.8071 17.7711 11.1499 16.7425L5.44594 12.3169Z"
            fill="#FBBC05"
          />
          <path
            id="Vector_4"
            d="M20.7497 9.6829C23.2744 9.6829 25.5185 10.5556 27.3107 12.2387L32.2198 7.32972C29.2431 4.55574 25.3783 2.85693 20.7497 2.85693C14.0484 2.85693 8.2667 6.70628 5.44592 12.3167L11.1497 16.7427C12.5055 12.6907 16.2926 9.6829 20.7497 9.6829Z"
            fill="#EA4335"
          />
        </g>
      </g>
    </svg>
  )
}

interface GetGoogleMonochromeLogo {
  isDarkMode: boolean
}

export const getMonochromeGoogleLogo = ({ isDarkMode }: GetGoogleMonochromeLogo) => {
  const fillColor = isDarkMode ? 'white' : 'black'

  const GoogleMonochromeLogo: React.FunctionComponent = (props: LogoProps) => {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 41 40" fill="none" {...props}>
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M25.8355 14.7613C24.5584 13.5329 22.9441 12.9032 21.1356 12.9032C17.9377 12.9032 15.2302 15.0813 14.2595 18.0232L14.2593 18.023C14.0142 18.7662 13.8712 19.5609 13.8712 20.3866C13.8712 21.2124 14.004 22.0072 14.2594 22.7504L14.2587 22.751H14.2595C15.2302 25.6929 17.9377 27.871 21.1356 27.871C22.7907 27.871 24.1904 27.4168 25.2939 26.6736V26.6732C26.5812 25.7958 27.4497 24.5055 27.746 22.9777H21.1355V18.3223H32.6808C32.8034 19.0758 32.875 19.85 32.875 20.6655C32.875 24.4332 31.5467 27.6126 29.2377 29.77L29.2378 29.7703C27.2148 31.6594 24.446 32.7742 21.1356 32.7742C16.3438 32.7742 12.2059 29.9871 10.1931 25.9407V25.94L10.193 25.9401C9.35521 24.2678 8.875 22.3891 8.875 20.3866C8.875 18.384 9.35521 16.5053 10.193 14.833H10.1934C12.2063 10.7869 16.344 8 21.1356 8C24.446 8 27.2148 9.22839 29.3298 11.231L25.8355 14.7613Z"
          fill={fillColor}
        />
      </svg>
    )
  }

  return GoogleMonochromeLogo
}
