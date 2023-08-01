import { ISender } from '@mallpopstar/partyline'

class PageSender {
  constructor(private sender: ISender) {}

  getTitle() {
    return this.sender.postRequest('page.getTitle')
  }

  setTitle(title: string) {
    return this.sender.postRequest('page.setTitle', title)
  }

  getUrl() {
    return this.sender.postRequest('page.getUrl')
  }

  setUrl(url: string) {
    return this.sender.postRequest('page.setUrl', url)
  }

  subscribe(event: 'title' | 'url', callback: (value: string) => void, options?: { returnInitialValue: boolean }) {
    return this.sender.subscribe('page.' + event, { options }, callback)
  }
}

export const createPageSender = (sender: ISender) => {
  return new PageSender(sender)
}
