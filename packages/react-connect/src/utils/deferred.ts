export class Deferred<T> {
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
