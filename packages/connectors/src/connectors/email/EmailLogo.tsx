import React from 'react'

interface GetEmailLogo {
  isDarkMode: boolean
}

export const getEmailLogo = ({ isDarkMode }: GetEmailLogo) => {
  const fillColor = isDarkMode ? 'white' : 'black'

  const EmailLogo: React.FunctionComponent = ({ ...props }) => {
    return (
      <React.Fragment>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 35 34" fill="none" {...props}>
          <path
            d="M17.0826 16.3805C17.1802 16.4598 17.32 16.4598 17.4176 16.3805L30.1401 6.04341C30.5283 5.72801 30.3053 5.09985 29.8051 5.09985H4.69499C4.19482 5.09985 3.9718 5.72801 4.35998 6.04341L17.0826 16.3805Z"
            fill={fillColor}
          />
          <path
            d="M19.7626 19.2667L33.3838 8.19943C33.731 7.91735 34.2501 8.16441 34.2501 8.61174V24.2249C34.2501 26.5721 32.3473 28.4749 30.0001 28.4749H4.50006C2.15285 28.4749 0.250061 26.5721 0.250061 24.2249V8.61174C0.250061 8.16441 0.769134 7.91735 1.11631 8.19943L14.7375 19.2667C16.2014 20.4561 18.2987 20.4561 19.7626 19.2667Z"
            fill={fillColor}
          />
        </svg>
      </React.Fragment>
    )
  }

  return EmailLogo
}
