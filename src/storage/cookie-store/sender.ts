import { ISender } from '@mallpopstar/partyline'

export class cookieStoreSender {
  constructor(private sender: ISender) {}

  getItem(key: string) {
    return this.sender.postRequest('cookieStore.getItem', {key})
  }

  setItem(key: string, value: string) {
    return this.sender.postRequest('cookieStore.setItem', {key, value})
  }

  subscribe(key: string, callback: (value: string) => void, options?: { returnInitialValue: boolean }) {
    return this.sender.subscribe('cookieStore', { key, options }, callback)
  }
}

export const createCookieStoreSender = (sender: ISender) => {
  return new cookieStoreSender(sender)
}
