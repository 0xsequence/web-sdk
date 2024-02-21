import { ethers } from 'ethers'
import { useState, useEffect } from 'react'

let _pendingConfirmation: Deferred<Boolean> | undefined

export type WaasRequestConfirmation = {
  type: 'signTransaction' | 'signMessage'
  message?: string
  tx?: ethers.Transaction
  chainId?: number
}

export function useWaasConfirmationHandler(
  waasConnector?: any
): [WaasRequestConfirmation | undefined, (id: string) => void, (id: string) => void] {
  const [pendingRequestConfirmation, setPendingRequestConfirmation] = useState<WaasRequestConfirmation | undefined>()

  function confirmPendingRequest(id: string) {
    _pendingConfirmation?.resolve(true)
    setPendingRequestConfirmation(undefined)
    _pendingConfirmation = undefined
  }

  function rejectPendingRequest(id: string) {
    _pendingConfirmation?.reject(false)
    setPendingRequestConfirmation(undefined)
    _pendingConfirmation = undefined
  }

  if (!waasConnector) return [undefined, confirmPendingRequest, rejectPendingRequest]

  useEffect(() => {
    async function setup() {
      const waasProvider = await waasConnector.getProvider()

      waasProvider.requestConfirmationHandler = {
        confirmSignTransactionRequest(tx: ethers.Transaction[]): Promise<Boolean> {
          const pending = new Deferred<Boolean>()
          _pendingConfirmation = pending
          return pending.promise
        },
        confirmSignMessageRequest(message: string, chainId: number): Promise<Boolean> {
          const pending = new Deferred<Boolean>()
          setPendingRequestConfirmation({ type: 'signMessage', message, chainId })
          _pendingConfirmation = pending
          return pending.promise
        }
      }
    }
    setup()
  })

  return [pendingRequestConfirmation, confirmPendingRequest, rejectPendingRequest]
}

class Deferred<T> {
  private _resolve: (value: T) => void = () => {}
  private _reject: (value: T) => void = () => {}

  private _promise: Promise<T> = new Promise<T>((resolve, reject) => {
    this._reject = reject
    this._resolve = resolve
  })

  get promise(): Promise<T> {
    return this._promise
  }

  resolve(value: T) {
    this._resolve(value)
  }

  reject(value: T) {
    this._reject(value)
  }
}
