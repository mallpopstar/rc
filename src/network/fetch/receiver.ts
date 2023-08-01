import { IReceiver } from '@mallpopstar/partyline'

let initialized = false
const responders: Map<string, any> = new Map()
const hasRequestIdleCallback = typeof window !== 'undefined' && 'requestIdleCallback' in window

const parseResponse = async (response: Response) => {
  if (response.ok) {
    try {
      const data = await response.json()
      return { status: response.status, data }
    } catch (e: any) {
      const data = await response.text()
      return { status: response.status, data }
    }
  } else {
    return { status: response.status, error: response.statusText }
  }
}

class FetchReceiver {
  #receiver: IReceiver

  constructor(receiver: IReceiver) {
    this.#receiver = receiver
  }

  start() {
    this.stop()

    this.#receiver.onRequest('fetch', async (req, res) => {
      const { url, requestOptions } = req.body
      const response = await fetch(url, requestOptions)
      const parsedResponse = await parseResponse(response)
      res.send(parsedResponse)
    })

    this.#receiver.onSubscribe('fetch', async (req, res) => {
      try {
        responders.set(req.id, res)

        if (!initialized) {
          initialized = true

          // Fetch interceptor
          const originalFetch = window.fetch

          window.fetch = async function (url, init) {
            // Make the request
            return originalFetch(url, init).then(response => {
              // Do something with the response
              const clonedResponse = response.clone()
              if (clonedResponse.ok) {
                if (hasRequestIdleCallback) {
                  window.requestIdleCallback(
                    async () => {
                      const data = await parseResponse(clonedResponse)
                      responders.forEach(res => {
                        res.send({ method: init?.method, url: clonedResponse.url, ...data })
                      })
                    },
                    {
                      timeout: 5000,
                    }
                  )
                } else {
                  setTimeout(async () => {
                    try {
                      const data = await parseResponse(clonedResponse)
                      responders.forEach(res => {
                        res.send({ method: init?.method, url: clonedResponse.url, ...data })
                      })
                    } catch (e) {
                      // console.warn(e)
                    }
                  }, 0)
                }
              }
              return response
            })
          }
        }
      } catch (e) {
        return
      }
    })

    this.#receiver.onUnsubscribe('fetch', (req, res) => {
      try {
        responders.delete(req.id)
        res.send()
      } catch (e) {
        res.send(e)
      }
    })

    return this
  }

  stop() {
    try {
      responders.clear()
      this.#receiver.removeAllHandlers(/\bfetch\b/)
    } catch (e: any) {
      console.warn('cleanup error', e.message)
    }
  }
}

export const createFetchReceiver = (receiver: IReceiver) => {
  return new FetchReceiver(receiver)
}
