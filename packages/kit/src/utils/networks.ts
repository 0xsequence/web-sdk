export const getChainColor = (chainId: number, mode: 'dark' | 'light' = 'light') => {
  switch (chainId) {
    case 1:
      return mode === 'light' ? '#abf' : '#abf'
    case 137:
      return mode === 'light' ? '#c7a6ff' : '#c7a6ff'
    case 42161:
      return mode === 'light' ? '#52A7E6' : '#52A7E6'
    case 10:
      return mode === 'light' ? '#DB3132' : '#DB3132'
    case 56:
      return mode === 'light' ? '#CB9C1D' : '#EEB445'
    case 43114:
      return mode === 'light' ? '#E84142' : '#E84142'
    case 100:
      return mode === 'light' ? '#00193C' : '#D8E8FF'
    case 5:
      return mode === 'light' ? '#A77A00' : '#FFA700'
    case 80001:
      return mode === 'light' ? '#D68828' : '#FFA700'
    default:
      return mode === 'light' ? '#abf' : '#abf'
  }
}

export const getChainBGColor = (chainId: number, mode: 'dark' | 'light' = 'light') => {
  switch (chainId) {
    case 1:
      return mode === 'light' ? '#132362' : '#132362'
    case 137:
      return mode === 'light' ? '#350881' : '#350881'
    case 42161:
      return mode === 'light' ? '#EDF7FF' : '#0C3754'
    case 10:
      return mode === 'light' ? '#FFEAE9' : '#390B0C'
    case 56:
      return mode === 'light' ? '#FFE8AB' : '#554018'
    case 43114:
      return mode === 'light' ? '#FBDFDF' : '#390B0C'
    case 100:
      return mode === 'light' ? '#D8E8FF' : '#00193C'
    case 5:
      return mode === 'light' ? '#FFD871' : '#554018'
    case 80001:
      return mode === 'light' ? '#FFE8CD' : '#554018'
    default:
      return mode === 'light' ? '#132362' : '#132362'
  }
}
