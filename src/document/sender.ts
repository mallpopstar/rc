import { ISender } from '@mallpopstar/partyline'

type Options = {
  traverseIframes?: boolean
  stopPropagation?: boolean
  preventDefault?: boolean
}

type KeyValue = {
  [key: string]: string
}

class DocumentSender {
  constructor(private sender: ISender) {}

  insertAdjacentHTML(selector: string, position: InsertPosition, html: string) {
    return this.sender.postRequest('document.insertAdjacentHTML', { selector, position, html })
  }

  querySelector(selector: string, deepQuery = false) {
    return this.sender.postRequest('document.querySelector', { selector, deepQuery })
  }

  exists(selector: string, deepQuery = false) {
    return this.sender.postRequest('document.exists', { selector, deepQuery })
  }

  remove(selector: string, options?: Options) {
    return this.sender.postRequest('document.remove', { selector, options })
  }

  addStyles(selector: string, styles: KeyValue, options?: Options) {
    return this.sender.postRequest('document.addStyles', { selector, styles, options })
  }

  restoreStyles(selector: string, options?: Options) {
    return this.sender.postRequest('document.restoreStyles', { selector, options })
  }

  addClasses(selector: string, classes: string, options?: Options) {
    return this.sender.postRequest('document.addClasses', { selector, classes, options })
  }

  removeClasses(selector: string, classes: string, options?: Options) {
    return this.sender.postRequest('document.removeClasses', { selector, classes, options })
  }

  toggleClasses(selector: string, classes: string, options?: Options) {
    return this.sender.postRequest('document.toggleClasses', { selector, classes, options })
  }

  restoreClasses(selector: string, options?: Options) {
    return this.sender.postRequest('document.restoreClasses', { selector, options })
  }

  subscribe(
    selector: string,
    event: 'presence' | 'mutate' | string,
    callback: (value: string) => void,
    options?: Options
  ) {
    let eventName = 'event'
    if (['presence', 'mutate'].includes(event)) {
      eventName = event
    }
    return this.sender.subscribe('document.' + eventName, { selector, event, options }, callback)
  }
}

export const createDocumentSender = (sender: ISender) => {
  return new DocumentSender(sender)
}
