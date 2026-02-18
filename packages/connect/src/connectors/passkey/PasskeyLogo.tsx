import React from 'react'

interface LogoProps extends React.SVGProps<SVGSVGElement> {}

interface GetPasskeyLogo {
  isDarkMode: boolean
}

export const getPasskeyLogo = ({ isDarkMode }: GetPasskeyLogo) => {
  const fillColor = isDarkMode ? 'white' : 'black'

  const PasskeyLogo: React.FunctionComponent<LogoProps> = (props: LogoProps) => {
    return (
      <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="none" color={fillColor} {...props}>
        <path
          fill="currentColor"
          d="M12.394 2a9 9 0 0 0-4.506 1.206 1 1 0 0 0 1 1.732 7 7 0 0 1 10.5 6.081v1.036a21 21 0 0 1-.859 6.682 1 1 0 0 0 1.918.57 23 23 0 0 0 .941-7.302v-.982A9 9 0 0 0 12.394 2"
        />
        <path
          fill="currentColor"
          d="M8.853 7.464A5 5 0 0 1 17.388 11a1 1 0 1 1-2 0 3 3 0 0 0-6 0v1a11 11 0 0 1-2.2 6.6 1 1 0 0 1-1.6-1.2 9 9 0 0 0 1.8-5.4v-1a5 5 0 0 1 1.465-3.536M16.505 14.007a1 1 0 0 1 .877 1.11 19 19 0 0 1-1.9 6.333 1 1 0 0 1-1.787-.9 17 17 0 0 0 1.7-5.666 1 1 0 0 1 1.11-.877M5.97 6.213a1 1 0 0 1 .323 1.377c-.888 1.431-.935 2.73-.924 4.168l.003.277c.016 1.346.034 2.933-.92 4.488a1 1 0 1 1-1.705-1.046c.645-1.05.636-2.095.624-3.549l-.002-.154c-.012-1.5.02-3.295 1.225-5.239a1 1 0 0 1 1.377-.322"
        />
        <path
          fill="currentColor"
          d="M13.411 10.958a1 1 0 1 0-1.998.084c.136 3.239-.275 5.152-.767 6.431a11 11 0 0 1-.798 1.623l-.15.253c-.223.377-.462.782-.64 1.189a1 1 0 1 0 1.833.8c.124-.284.284-.555.499-.919q.087-.145.185-.315c.298-.51.635-1.124.939-1.913.61-1.588 1.042-3.784.897-7.233"
        />
      </svg>
    )
  }

  return PasskeyLogo
}
