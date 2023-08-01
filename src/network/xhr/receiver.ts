// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
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

class XHRReceiver {
  #receiver: IReceiver

  async #xhr(url: string, options: RequestInit) {
    try {
      const response = await xhr(url, options)
      if (response.ok) {
        const data = await response.text()
        return { status: response.status, data }
      } else {
        return { status: response.status, error: response.statusText }
      }
    } catch (e: any) {
      return { status: '000', error: e.message }
    }
  }

  constructor(receiver: IReceiver) {
    this.#receiver = receiver
  }

  start() {
    this.stop()
    
    this.#receiver.onSubscribe('xhr', async (req, res) => {
      try {
        responders.set(req.id, res)

        if (!initialized) {
          initialized = true

          // const xhrInterceptor = xhr => {
          const xhrInterceptor = () => {
            try {
              const XHR = XMLHttpRequest.prototype
              const open = XHR.open
              const send = XHR.send
              const setRequestHeader = XHR.setRequestHeader
              XHR.open = function (method, url) {
                this._method = method
                this._url = url
                this._requestHeaders = {}
                this._startTime = new Date().toISOString()
                // eslint-disable-next-line prefer-rest-params
                return open.apply(this, arguments)
              }
              XHR.setRequestHeader = function (header, value) {
                this._requestHeaders[header] = value
                // eslint-disable-next-line prefer-rest-params
                return setRequestHeader.apply(this, arguments)
              }
              // XHR.send = function (postData) {
              XHR.send = function () {
                this.addEventListener('load', async function () {
                  // const endTime = new Date().toISOString()
                  const url = this._url
                  if (url) {
                    const data = await parseResponse(this.response)
                    if (hasRequestIdleCallback) {
                      window.requestIdleCallback(
                        () => {
                          responders.forEach(res => {
                            res.send({
                              method: this._method,
                              url,
                              ...data,
                            })
                          })
                        },
                        { timeout: 5000 }
                      )
                    } else {
                      setTimeout(() => {
                        responders.forEach(res => {
                          res.send({
                            method: this._method,
                            url,
                            ...data,
                          })
                        })
                      }, 0)
                    }
                  }
                })
                // eslint-disable-next-line prefer-rest-params
                return send.apply(this, arguments)
              }
            } catch (e) {
              // console.warn(e)
            }
          }
          xhrInterceptor(XMLHttpRequest)
        }
      } catch (e) {
        return
      }
    })

    this.#receiver.onUnsubscribe('xhr', (req, res) => {
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
      this.#receiver.removeAllHandlers(/\bxhr\b/)
    } catch (e: any) {
      console.warn('cleanup error', e.message)
    }
  }
}

export const createXHRReceiver = (receiver: IReceiver) => {
  return new XHRReceiver(receiver)
}
