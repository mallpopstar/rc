import { ISender } from '@mallpopstar/partyline'

class XHRSender {
  constructor(private sender: ISender) {}

  subscribe(callback: (value: string) => void, options?: { match?: RegExp }) {
    return this.sender.subscribe('xhr', { options }, callback)
  }
}

export const createXHRSender = (sender: ISender) => {
  return new XHRSender(sender)
}
