import { english } from 'viem/accounts'

export const getWord = (index: number): string => {
  if (index < 0 || index >= english.length) {
    throw new Error(`Word index ${index} is out of range. Must be between 0 and ${english.length - 1}`)
  }
  return english[index]
}

export const getWordCount = (): number => {
  return english.length
}
