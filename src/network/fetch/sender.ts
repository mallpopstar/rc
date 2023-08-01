import { ISender } from '@mallpopstar/partyline'

type ResponseOptions = {
  type: 'text' | 'json'
}

class FetchSender {
  constructor(private sender: ISender) {}

  get(url: string, requestOptions?: RequestInit, responseOptions?: ResponseOptions) {
    requestOptions = requestOptions || {}
    requestOptions.method = 'GET'
    return this.sender.postRequest('fetch', { url, requestOptions, responseOptions })
  }

  post(url: string, requestOptions?: RequestInit, responseOptions?: ResponseOptions) {
    requestOptions = requestOptions || {}
    requestOptions.method = 'POST'
    return this.sender.postRequest('fetch', { url, requestOptions, responseOptions })
  }

  put(url: string, requestOptions?: RequestInit, responseOptions?: ResponseOptions) {
    requestOptions = requestOptions || {}
    requestOptions.method = 'PUT'
    return this.sender.postRequest('fetch', { url, requestOptions, responseOptions })
  }

  delete(url: string, requestOptions?: RequestInit, responseOptions?: ResponseOptions) {
    requestOptions = requestOptions || {}
    requestOptions.method = 'DELETE'
    return this.sender.postRequest('fetch', { url, requestOptions, responseOptions })
  }

  subscribe(handler: (value: string) => void, options?: { urlFilter?: string | RegExp }) {
    const opts: any = { ...options }
    if (options?.urlFilter) {
      if (typeof options.urlFilter === 'string') {
        opts.urlFilterType = 'string'
      } else {
        opts.urlFilterType = 'regexp'
      }
    }
    return this.sender.subscribe('fetch', { options: opts }, handler)
  }
}

export const createFetchSender = (sender: ISender) => {
  return new FetchSender(sender)
}
