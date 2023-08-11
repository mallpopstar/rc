import { IReceiver } from '@mallpopstar/partyline'

class ErrorReceiver {
  #receiver: IReceiver
  #handlers: Map<string, any> = new Map()
  #initialized = false

  #errorHandler = (event: ErrorEvent) => {
    const errorData = {
      message: event.error?.message,
      stack: event.error?.stack,
      url: location.href
    }

    this.#handlers.forEach(handler => handler(errorData))
  }

  #rejectionHandler = (event: PromiseRejectionEvent) => {
    const errorData = {
      message: event.reason?.message,
      stack: event.reason?.stack,
      url: location.href
    }

    this.#handlers.forEach(handler => handler(errorData))
  }

  constructor(receiver: IReceiver) {
    this.#receiver = receiver
  }

  start() {
    this.stop()

    if (!this.#initialized) {
      this.#initialized = true
      window.addEventListener('error', this.#errorHandler)
      window.addEventListener('unhandledrejection', this.#rejectionHandler)
    }

    this.#receiver.onSubscribe('error', async (req, res) => {
      const handler = (error: any) => {
        res.send(error)
      }

      this.#handlers.set(req.id, handler)
    })
  }

  stop() {
    try {
      window.removeEventListener('error', this.#errorHandler)
      window.removeEventListener('unhandledrejection', this.#rejectionHandler)
      this.#handlers.forEach(handler => handler())
      this.#handlers.clear()
      this.#receiver.removeAllHandlers(/\berror\b/)
    } catch (e: any) {
      console.warn('cleanup error', e.message)
    }
  }
}

export const createErrorReceiver = (receiver: IReceiver) => {
  return new ErrorReceiver(receiver)
}
