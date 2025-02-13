type ConnectionState = 'disconnected' | 'connecting' | 'connected'

interface SessionData {
  walletAddress: string
  lastConnected: number
}

export class ProviderTransport {
  private walletOrigin: string
  private walletWindow: Window | null = null
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private callbacks: Map<string, (response: any) => void> = new Map()
  private connectionState: ConnectionState = 'disconnected'
  private session: SessionData | undefined
  private walletCheckInterval: number | undefined

  constructor(walletUrl: string) {
    const url = new URL(walletUrl)
    this.walletOrigin = url.origin
    window.addEventListener('message', this.handleMessage)
    this.loadSession()
    this.observeCallbacks()
  }

  private observeCallbacks() {
    const originalSet = this.callbacks.set.bind(this.callbacks)
    const originalDelete = this.callbacks.delete.bind(this.callbacks)

    this.callbacks.set = (key, value) => {
      const result = originalSet(key, value)
      this.updateWalletCheck()
      return result
    }

    this.callbacks.delete = key => {
      const result = originalDelete(key)
      this.updateWalletCheck()
      return result
    }
  }

  private updateWalletCheck() {
    if (this.callbacks.size > 0) {
      this.ensureWalletCheckActive()
    } else {
      this.ensureWalletCheckInactive()
    }
  }

  private ensureWalletCheckActive() {
    if (this.walletCheckInterval === undefined) {
      this.walletCheckInterval = window.setInterval(() => {
        if (!this.isWalletOpen()) {
          this.handleWalletClosed()
        }
      }, 500) // Check every half second
    }
  }

  private ensureWalletCheckInactive() {
    if (this.walletCheckInterval !== undefined) {
      clearInterval(this.walletCheckInterval)
      this.walletCheckInterval = undefined
    }
  }

  private loadSession() {
    const sessionData = localStorage.getItem('walletSession')
    if (sessionData) {
      this.session = JSON.parse(sessionData)
      this.connectionState = 'connected'
    }
  }

  private saveSession(walletAddress: string) {
    this.session = { walletAddress, lastConnected: Date.now() }
    localStorage.setItem('walletSession', JSON.stringify(this.session))
  }

  async connect(): Promise<{ walletAddress: string }> {
    if (this.connectionState === 'connected' && this.session) {
      return { walletAddress: this.session.walletAddress }
    }

    this.connectionState = 'connecting'
    const connectionId = crypto.randomUUID()
    const connectionRequest = { type: 'connection', id: connectionId }

    return new Promise((resolve, reject) => {
      this.callbacks.set(connectionId, response => {
        if (response.type === 'connection' && response.status === 'accepted') {
          this.connectionState = 'connected'
          this.saveSession(response.walletAddress)
          resolve({ walletAddress: response.walletAddress })
          this.walletWindow?.close()
        } else {
          this.connectionState = 'disconnected'
          reject(new Error('Connection rejected'))
          this.walletWindow?.close()
        }
      })

      this.openWalletAndPostMessage(connectionRequest)
    })
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async sendRequest(method: string, params: any[], chainId: number): Promise<any> {
    if (this.connectionState !== 'connected') {
      throw new Error('Not connected to wallet. Call connect() first.')
    }

    const id = crypto.randomUUID()
    const request = { type: 'request', id, method, params, chainId }

    return new Promise((resolve, reject) => {
      const sendMessage = async () => {
        if (!this.isWalletOpen()) {
          try {
            await this.openWalletAndPostMessage(request)
          } catch (error) {
            this.callbacks.delete(id)
            reject(error)
            return
          }
        } else {
          this.postMessageToWallet(request)
        }
      }

      this.callbacks.set(id, response => {
        if (response.error) {
          reject(new Error(response.error.message))
        } else {
          resolve(response.result)
        }

        // Close the wallet window after receiving the response
        if (this.isWalletOpen()) {
          this.walletWindow!.close()
          this.walletWindow = null
        }
      })

      sendMessage().catch(reject)
    })
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private openWalletAndPostMessage(message: any): Promise<void> {
    return new Promise((resolve, reject) => {
      console.log('Opening wallet and posting message:', message)
      if (!this.isWalletOpen()) {
        this.walletWindow = window.open(this.walletOrigin, 'Wallet', 'width=375,height=667')
        if (!this.walletWindow) {
          reject(new Error('Failed to open wallet window. Please check your pop-up blocker settings.'))
          return
        }

        const waitForReady = (event: MessageEvent) => {
          if (event.origin === this.walletOrigin && event.data === 'ready') {
            console.log('Received ready message from wallet')
            window.removeEventListener('message', waitForReady)
            this.postMessageToWallet(message)
            resolve()
          }
        }
        window.addEventListener('message', waitForReady)
      } else {
        this.postMessageToWallet(message)
        resolve()
      }
    })
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private postMessageToWallet(message: any) {
    console.log('Posting message to wallet:', message)
    this.walletWindow!.postMessage(message, {
      targetOrigin: this.walletOrigin
    })
  }

  private isWalletOpen(): boolean {
    return this.walletWindow !== null && !this.walletWindow?.closed
  }

  private handleWalletClosed() {
    this.walletWindow = null
    this.callbacks.forEach(callback => {
      callback({ error: { message: 'Wallet window was closed' } })
    })
    this.callbacks.clear()
  }

  private handleMessage = (event: MessageEvent) => {
    if (event.origin !== this.walletOrigin) return

    const response = event.data
    const callback = this.callbacks.get(response.id)
    if (callback) {
      callback(response)
      this.callbacks.delete(response.id)
    }
  }

  disconnect() {
    this.connectionState = 'disconnected'
    this.session = undefined
    localStorage.removeItem('walletSession')
    if (this.isWalletOpen()) {
      this.walletWindow!.close()
    }
    this.walletWindow = null
    this.handleWalletClosed()
  }

  getWalletAddress(): string | undefined {
    return this.session?.walletAddress
  }
}
