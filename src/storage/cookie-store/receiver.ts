import { IReceiver } from '@mallpopstar/partyline'
import { useInterval } from '@/utils/interval'

declare const cookieStore: any

class cookieStoreReceiver {
  #receiver: IReceiver
  #handlers: Map<string, any> = new Map()

  async #getItem(key: string) {
    return (await cookieStore.get(key))?.value
  }

  #setItem(key: string, value: string) {
    cookieStore.set(key, value)
  }

  constructor(receiver: IReceiver) {
    this.#receiver = receiver
  }

  start() {
    this.stop()
    
    this.#receiver.onRequest('cookieStore.getItem', async (req, res) => {
      const { key } = req.body
      const val = await this.#getItem(key)
      res.send(val)
    })

    this.#receiver.onRequest('cookieStore.setItem', (req, res) => {
      const { key, value } = req.body
      this.#setItem(key, value)
      res.send()
    })

    this.#receiver.onSubscribe('cookieStore', async (req, res) => {
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
        res.send(e)
      }
    })

    this.#receiver.onUnsubscribe('cookieStore', req => {
      try {
        this.#handlers.delete(req.id)
      } catch (e) {
        console.log(e)
      }
    })

    return this
  }

  stop() {
    try {
      this.#handlers.forEach(handler => handler())
      this.#handlers.clear()
      this.#receiver.removeAllHandlers(/\bcookieStore\b/)
    } catch (e: any) {
      console.warn('cleanup error', e.message)
    }
  }
}

export const createCookieStoreReceiver = (receiver: IReceiver) => {
  return new cookieStoreReceiver(receiver)
}
