import { ISender } from '@mallpopstar/partyline'

class LocalStorageSender {
  constructor(private sender: ISender) {}

  getItem(key: string) {
    return this.sender.postRequest('localStorage.getItem', { key })
  }

  setItem(key: string, value: string) {
    return this.sender.postRequest('localStorage.setItem', { key, value })
  }

  subscribe(key: string, callback: (value: string) => void, options?: { returnInitialValue: boolean }) {
    return this.sender.subscribe('localStorage', { key, options }, callback)
  }
}

export const createLocalStorageSender = (sender: ISender) => {
  return new LocalStorageSender(sender)
}
