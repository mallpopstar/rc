import { IReceiver } from '@mallpopstar/partyline'
import { useInterval } from '@/utils/interval'

class PageReceiver {
  #receiver: IReceiver
  #handlers: Map<string, any> = new Map()

  constructor(receiver: IReceiver) {
    this.#receiver = receiver
  }

  start() {
    this.stop()
    
    this.#receiver.onRequest('page.getTitle', async (_, res) => {
      res.send(document.title)
    })

    this.#receiver.onRequest('page.setTitle', (req, res) => {
      document.title = req.body
      res.send(true)
    })

    this.#receiver.onRequest('page.getUrl', async (_, res) => {
      res.send(location.href)
    })

    this.#receiver.onRequest('page.setUrl', (req, res) => {
      location.href = req.body
      res.send()
    })

    this.#receiver.onSubscribe('page.title', async (req, res) => {
      let curTitle = ''
      const { options } = req.body
      const handler = () => {
        if (document.title !== curTitle) {
          curTitle = document.title
          res.send(document.title)
        }
      }
      this.#handlers.set(req.id, useInterval(handler))
      if (options?.returnInitialValue) {
        res.send(document.title)
      }
    })

    this.#receiver.onSubscribe('page.url', async (req, res) => {
      let curUrl = ''
      const { options } = req.body
      const handler = () => {
        const url = location.href
        if (url !== curUrl) {
          curUrl = url
          res.send(url)
        }
      }
      this.#handlers.set(req.id, useInterval(handler))
      if (options?.returnInitialValue) {
        res.send(location.href)
      }
    })

    this.#receiver.onUnsubscribe('page', (req, res) => {
      try {
        this.#handlers.delete(req.id)
        res.send()
      } catch (e) {
        res.send(e)
      }
    })
  }

  stop() {
    try {
      this.#handlers.forEach(handler => handler())
      this.#handlers.clear()
      this.#receiver.removeAllHandlers(/\bpage\b/)
    } catch (e: any) {
      console.warn('cleanup error', e.message)
    }
  }
}

export const createPageReceiver = (receiver: IReceiver) => {
  return new PageReceiver(receiver)
}
