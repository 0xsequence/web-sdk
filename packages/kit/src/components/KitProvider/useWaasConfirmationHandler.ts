import { ethers } from 'ethers'
import { useState, useEffect } from 'react'

let _pendingConfirmation: Deferred<Boolean> | undefined

export function useWaasConfirmationHandler(
  waasConnector?: any
): [string | undefined, (id: string) => void, (id: string) => void] {
  const [pendingSignMessageConfirmation, setPendingSignMessageConfirmation] = useState<string | undefined>()

  function confirmPendingRequest(id: string) {
    _pendingConfirmation?.resolve(true)
    setPendingSignMessageConfirmation(undefined)
    _pendingConfirmation = undefined
  }

  function rejectPendingRequest(id: string) {
    _pendingConfirmation?.reject(false)
    setPendingSignMessageConfirmation(undefined)
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
          setPendingSignMessageConfirmation(message)
          _pendingConfirmation = pending
          return pending.promise
        }
      }
    }
    setup()
  })

  return [pendingSignMessageConfirmation, confirmPendingRequest, rejectPendingRequest]
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
