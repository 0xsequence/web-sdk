export const compareAddress = (a: string, b: string) => {
  return a.toLowerCase() === b.toLowerCase()
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

export const capitalize = (word: string) => {
  return word.charAt(0).toUpperCase() + word.slice(1)
}

export const limitDecimals = (value: string, decimals: number) => {
  const splitValue = value.split('.')
  if (splitValue.length === 1) {
    return value
  }
  return `${splitValue[0]}.${splitValue[1].slice(0, decimals)}`
}

export const isEthAddress = (value: string) => {
  const ethAddressRegEx = /0x[a-fA-F0-9]{40}/
  const isEthAddress = ethAddressRegEx.test(value)

  return isEthAddress
}

// Gets n random elements at unique keys from collection up to the size of collection.
export const sampleSize = <T>(collection: T[], n: number): T[] => {
  const length = collection.length

  if (!length || n < 1) {
    return []
  }

  // Limit n to the size of the collection
  n = n > length ? length : n

  const sampled = new Array(n)
  const indexes = new Set<number>()
  while (indexes.size < n) {
    indexes.add(Math.floor(Math.random() * length))
  }

  let index = 0
  for (const i of indexes) {
    sampled[index++] = collection[i]
  }
  return sampled
}
