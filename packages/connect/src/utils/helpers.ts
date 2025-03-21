export const isEmailValid = (email: string) => {
  return /^\S+@\S+\.\S{2,}$/.test(email)
}

export const compareAddress = (a: string, b: string) => {
  return a.toLowerCase() === b.toLowerCase()
}

enum ValueType {
  VERY_LARGE,
  FRACTION,
  VERY_TINY,
  MIXED
}

interface FormatDisplayOptions {
  disableScientificNotation?: boolean
  disableCompactNotation?: boolean
  significantDigits?: number
  maximumFractionDigits?: number
}

export const formatDisplay = (_val: number | string, options?: FormatDisplayOptions): string => {
  if (isNaN(Number(_val))) {
    console.error(`display format error ${_val} is not a number`)
    return 'NaN'
  }

  const val = Number(_val)

  if (val === 0) {
    return '0'
  }

  let valMode: ValueType

  if (val > 100000000) {
    if (options?.disableCompactNotation) {
      valMode = ValueType.MIXED
    } else {
      valMode = ValueType.VERY_LARGE
    }
  } else if (val < 0.0000000001) {
    if (options?.disableScientificNotation) {
      valMode = ValueType.FRACTION
    } else {
      valMode = ValueType.VERY_TINY
    }
  } else if (val < 1) {
    valMode = ValueType.FRACTION
  } else {
    valMode = ValueType.MIXED
  }

  let notation: Intl.NumberFormatOptions['notation'] = undefined
  let config: Pick<Intl.NumberFormatOptions, 'maximumFractionDigits' | 'maximumSignificantDigits'>

  const maximumSignificantDigits = options?.significantDigits ?? 4

  switch (valMode) {
    case ValueType.VERY_LARGE:
      notation = 'compact'
      config = {
        maximumSignificantDigits,
        maximumFractionDigits: options?.maximumFractionDigits
      }
      break
    case ValueType.VERY_TINY:
      notation = 'scientific'
      config = {
        maximumSignificantDigits,
        maximumFractionDigits: options?.maximumFractionDigits
      }
      break
    case ValueType.FRACTION:
      notation = 'standard'
      config = {
        maximumSignificantDigits,
        maximumFractionDigits: options?.maximumFractionDigits
      }
      break
    default:
      notation = 'standard'
      config = {
        maximumSignificantDigits,
        maximumFractionDigits: options?.maximumFractionDigits
      }
  }

  return Intl.NumberFormat('en-US', {
    notation,
    ...config
  }).format(val)
}

export const capitalize = (word: string) => {
  return word.charAt(0).toUpperCase() + word.slice(1)
}

export const truncateAtMiddle = (text: string, truncateAt: number) => {
  let finalText = text

  if (text.length >= truncateAt) {
    finalText = text.slice(0, truncateAt / 2) + '...' + text.slice(text.length - truncateAt / 2, text.length)
  }

  return finalText
}

export const formatAddress = (text: string) => {
  return `0x${truncateAtMiddle(text?.substring(2) || '', 8)}`
}

export const isJSON = (str?: string) => {
  if (!str) {
    return false
  }
  try {
    JSON.parse(str)
  } catch (e) {
    return false
  }
  return true
}

export const normalizeChainId = (chainId: string | number | bigint | { chainId: string }): number => {
  if (typeof chainId === 'object') {
    return normalizeChainId(chainId.chainId)
  }
  if (typeof chainId === 'string') {
    return Number.parseInt(chainId, chainId.trim().substring(0, 2) === '0x' ? 16 : 10)
  }
  if (typeof chainId === 'bigint') {
    return Number(chainId)
  }
  return chainId
}
