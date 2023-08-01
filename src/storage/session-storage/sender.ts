import { ISender } from '@mallpopstar/partyline'

class SessionStorageSender {
  constructor(private sender: ISender) {}

  getItem(key: string) {
    return this.sender.postRequest('sessionStorage.getItem', { key })
  }

  setItem(key: string, value: string) {
    return this.sender.postRequest('sessionStorage.setItem', { key, value })
  }

  subscribe(key: string, callback: (value: string) => void, options?: { returnInitialValue: boolean }) {
    return this.sender.subscribe('sessionStorage', { key, options }, callback)
  }
}

export const createSessionStorageSender = (sender: ISender) => {
  return new SessionStorageSender(sender)
}
