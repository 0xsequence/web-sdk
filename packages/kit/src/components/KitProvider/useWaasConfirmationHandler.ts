import { ethers } from 'ethers'
import { useState, useEffect } from 'react'

export function useWaasConfirmationHandler(
  waasConnector?: any
): [string | undefined, (id: string) => void, (id: string) => void] {
  const [pendingSignMessageConfirmation, setPendingSignMessageConfirmation] = useState<string | undefined>()

  let pendingConfirmation: Deferred<Boolean> | undefined

  function confirmPendingRequest(id: string) {
    pendingConfirmation?.resolve(true)
    setPendingSignMessageConfirmation(undefined)
  }

  function rejectPendingRequest(id: string) {
    console.log('asda')
    pendingConfirmation?.reject(false)
    setPendingSignMessageConfirmation(undefined)
  }

  if (!waasConnector) return [undefined, confirmPendingRequest, rejectPendingRequest]

  useEffect(() => {
    async function setup() {
      const waasProvider = await waasConnector.getProvider()

      waasProvider.requestConfirmationHandler = {
        confirmSignTransactionRequest(tx: ethers.Transaction[]): Promise<Boolean> {
          pendingConfirmation = new Deferred<Boolean>()
          return pendingConfirmation.promise
        },
        confirmSignMessageRequest(message: string, chainId: number): Promise<Boolean> {
          setPendingSignMessageConfirmation(message)
          pendingConfirmation = new Deferred<Boolean>()
          return pendingConfirmation.promise
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

  public get promise(): Promise<T> {
    return this._promise
  }

  public resolve(value: T) {
    this._resolve(value)
  }

  public reject(value: T) {
    this._reject(value)
  }
}
