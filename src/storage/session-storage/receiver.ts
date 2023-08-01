import { IReceiver } from '@mallpopstar/partyline'
import { useInterval } from '@/utils/interval'

class SessionStorageReceiver {
  #receiver: IReceiver
  #handlers: Map<string, any> = new Map()

  async #getItem(key: string) {
    const val = sessionStorage.getItem(key)
    return JSON.parse(val ?? 'null')
  }

  #setItem(key: string, value: any) {
    sessionStorage.setItem(key, JSON.stringify(value))
  }

  constructor(receiver: IReceiver) {
    this.#receiver = receiver
  }

  start() {
    this.stop()
    
    this.#receiver.onRequest('sessionStorage.getItem', async (req, res) => {
      const { key } = req.body
      const val = await this.#getItem(key)
      res.send(val)
    })

    this.#receiver.onRequest('sessionStorage.setItem', (req, res) => {
      const { key, value } = req.body
      this.#setItem(key, value)
      res.send()
    })

    this.#receiver.onSubscribe('sessionStorage', async (req, res) => {
      try {
        const { key, options } = req.body
        let curVal: string | null = await this.#getItem(key)
        const handler = async () => {
          try {
            const newVal = await this.#getItem(key)
            if (newVal !== curVal) {
              curVal = newVal
              res.send({
                oldValue: curVal,
                newValue: newVal,
              })
            }
          } catch (e) {
            res.send(e)
          }
        }
        this.#handlers.set(req.id, useInterval(handler))
        if (options?.returnInitialValue) {
          res.send({
            oldValue: curVal,
            newValue: curVal,
          })
        }
      } catch (e) {
        res.send(null)
      }
    })

    this.#receiver.onUnsubscribe('sessionStorage', (req, res) => {
      try {
        this.#handlers.delete(req.id)
        res.send()
      } catch (e) {
        res.send(e)
      }
    })

    return this
  }

  stop() {
    try {
      this.#handlers.forEach(handler => handler())
      this.#handlers.clear()
      this.#receiver.removeAllHandlers(/\bsessionStorage\b/)
    } catch (e: any) {
      console.warn('cleanup error', e.message)
    }
  }
}

export const createSessionStorageReceiver = (receiver: IReceiver) => {
  return new SessionStorageReceiver(receiver)
}
