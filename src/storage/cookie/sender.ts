import { ISender } from '@mallpopstar/partyline'

export class CookieSender {
  constructor(private sender: ISender) {}

  getItem(key: string) {
    return this.sender.postRequest('cookie.getItem', { key })
  }

  setItem(key: string, value: string) {
    return this.sender.postRequest('cookie.setItem', { key, value })
  }

  subscribe(key: string, callback: (value: string) => void, options?: { returnInitialValue: boolean }) {
    return this.sender.subscribe('cookie', { key, options }, callback)
  }
}

export const createCookieSender = (sender: ISender) => {
  return new CookieSender(sender)
}
