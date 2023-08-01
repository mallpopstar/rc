import { Cookie } from './cookie'
import { IReceiver } from '@mallpopstar/partyline'
import { useInterval } from '@/utils/interval'

class CookieReceiver {
  #receiver: IReceiver
  #handlers: Map<string, any> = new Map()
  #cookie = new Cookie()

  async #getItem(key: string) {
    return this.#cookie.getItem(key)
  }

  #setItem(key: string, value: string) {
    this.#cookie.setItem(key, value)
  }

  constructor(receiver: IReceiver) {
    this.#receiver = receiver
  }

  start() {
    this.stop()
    
    this.#receiver.onRequest('cookie.getItem', async (req, res) => {
      const { key } = req.body
      const val = await this.#getItem(key)
      res.send(val)
    })

    this.#receiver.onRequest('cookie.setItem', (req, res) => {
      const { key, value } = req.body
      this.#setItem(key, value)
      res.send()
    })

    this.#receiver.onSubscribe('cookie', async (req, res) => {
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

    this.#receiver.onUnsubscribe('cookie', (req, res) => {
      try {
        this.#handlers.delete(req.id)
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
      this.#receiver.removeAllHandlers(/\bcookie\b/)

    } catch (e: any) {
      console.warn('cleanup error', e.message)
    }
  }
}

export const createCookieReceiver = (receiver: IReceiver) => {
  return new CookieReceiver(receiver)
}
