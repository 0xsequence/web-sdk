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

export const formatDisplay = (_val: number | string): string => {
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
    valMode = ValueType.VERY_LARGE
  } else if (val < 0.0000000001) {
    valMode = ValueType.VERY_TINY
  } else if (val < 1) {
    valMode = ValueType.FRACTION
  } else {
    valMode = ValueType.MIXED
  }

  let notation: Intl.NumberFormatOptions['notation'] = undefined
  let config: Pick<Intl.NumberFormatOptions, 'maximumFractionDigits' | 'maximumSignificantDigits'>

  switch (valMode) {
    case ValueType.VERY_LARGE:
      notation = 'compact'
      config = {
        maximumFractionDigits: 4
      }
      break
    case ValueType.VERY_TINY:
      notation = 'scientific'
      config = {
        maximumFractionDigits: 4
      }
      break
    case ValueType.FRACTION:
      notation = 'standard'
      config = {
        maximumSignificantDigits: 4
      }
      break
    default:
      notation = 'standard'
      config = {
        maximumFractionDigits: 2
      }
  }

  return Intl.NumberFormat('en-US', {
    notation,
    ...config
  }).format(val)
}
