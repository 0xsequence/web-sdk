import React, { Fragment, createRef, useEffect, useMemo } from 'react'
import { Box } from '@0xsequence/design-system'
import { digitInput } from '../../styles.css'

interface PINCodeInputProps {
  digits: number
  onChange: (code: string[]) => void
  disabled?: boolean
  value: string[]
}

export const PINCodeInput = (props: PINCodeInputProps) => {
  const { value, digits = 6, onChange, disabled = false } = props

  const inputRefs = useMemo(() => {
    return range(0, digits).map(() => createRef<HTMLInputElement>())
  }, [])

  useEffect(() => {
    inputRefs[0]?.current?.focus()
  }, [])

  const handleChange = (idx: number, character: string) => {
    if (!/^\d$/.test(character)) {
      character = ''
    }

    const curr = [...value]
    curr[idx] = character

    if (character !== '') {
      inputRefs[idx + 1]?.current?.focus()
    }

    onChange(curr)
  }

  const handleKeyDown = (idx: number, ev: React.KeyboardEvent<HTMLInputElement>) => {
    const currentRef = inputRefs[idx].current
    const prevRef = inputRefs[idx - 1]?.current
    const nextRef = inputRefs[idx + 1]?.current

    switch (ev.key) {
      case 'Backspace':
        ev.preventDefault()

        if (currentRef) {
          currentRef.value = ''
          handleChange(idx, '')
        }

        prevRef?.focus()
        break

      case 'ArrowLeft':
        ev.preventDefault()
        prevRef?.focus()
        break

      case 'ArrowRight':
        ev.preventDefault()
        nextRef?.focus()
        break

      default:
        // Fire an onChange event even if the key pressed is the same as the current value
        if (currentRef?.value === ev.key) {
          ev.preventDefault()
          handleChange(idx, ev.key)
        }
    }
  }

  const handlePaste = (_: number, ev: React.ClipboardEvent<HTMLInputElement>) => {
    const pasted = ev.clipboardData.getData('text/plain')
    const filtered = pasted.replace(/\D/g, '')

    if (/^\d{6}$/.test(filtered)) {
      inputRefs[0]?.current?.focus()

      onChange(filtered.split(''))

      setTimeout(() => {
        inputRefs[inputRefs.length - 1]?.current?.focus()
      })
    }
  }

  return (
    <Box gap="2">
      {range(0, digits).map(idx => (
        <Fragment key={idx}>
          {idx === digits / 2 && <span />}
          <Box
            as="input"
            className={digitInput}
            value={value[idx] || ''}
            ref={inputRefs[idx]}
            type="text"
            inputMode="numeric"
            maxLength={1}
            disabled={disabled}
            onFocus={ev => ev.target.select()}
            onPaste={ev => handlePaste(idx, ev)}
            onChange={ev => handleChange(idx, ev.target.value)}
            onKeyDown={ev => {
              handleKeyDown(idx, ev)
            }}
          />
        </Fragment>
      ))}
    </Box>
  )
}

const range = (start: number, end: number) => Array.from({ length: end - start }, (_, k) => k + start)
