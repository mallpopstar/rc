import { IReceiver } from '@mallpopstar/partyline'
import { useInterval } from '@/utils/interval'

type KeyValue = {
  [key: string]: string
}

class DocumentReceiver {
  #receiver: IReceiver
  #handlers = new Map<string, any>()

  #querySelector = (targetWindow: Window, selector: string, traverseIframes = false): any => {
    try {
      const el = targetWindow.document.querySelector(selector)
      if (el) {
        return el
      }

      if (traverseIframes) {
        const frames = targetWindow.frames
        for (let i = 0; i < frames.length; i++) {
          const el = this.#querySelector(frames[i].window, selector, traverseIframes)
          if (el) {
            return el
          }
        }
      }
      return null
    } catch (error) {
      // logger.warn('could not access this window')
      return null
    }
  }

  #removeElement = (targetWindow: Window, selector: string, traverseIframes = false): any => {
    try {
      const el = targetWindow.document.querySelector(selector)
      if (el) {
        return el.remove()
      }

      const frames = targetWindow.frames
      for (let i = 0; i < frames.length; i++) {
        const el = this.#querySelector(frames[i].window, selector, traverseIframes)
        if (el) {
          return el.remove()
        }
      }
      return {
        success: true,
      }
    } catch (error) {
      return {
        success: false,
        error,
      }
    }
  }

  #styleToString = (style: KeyValue) => {
    return Object.keys(style).reduce(
      (acc, key) =>
        acc +
        key
          .split(/(?=[A-Z])/)
          .join('-')
          .toLowerCase() +
        ':' +
        style[key] +
        ';',
      ''
    )
  }

  #stringToStyle = (style: string) => {
    const styles: KeyValue = {}
    style.split(';').forEach(s => {
      const parts = s.split(':', 2)
      if (parts.length > 1) {
        styles[parts[0].trim().replace(/-([a-z])/gi, (_, l) => l.toUpperCase())] = parts[1].trim()
      }
    })
    return styles
  }

  #processFormValues = (form?: HTMLFormElement) => {
    const data = new FormData(form)
    const entries = data.entries()
    const values: any = {}
    for (const entry of entries) {
      values[entry[0]] = entry[1]
    }
    return values
  }

  constructor(receiver: IReceiver) {
    this.#receiver = receiver
  }

  start() {
    this.stop()
    
    this.#receiver.onRequest('document.insertAdjacentHTML', (req, res) => {
      const { selector, position, html } = req.body
      const element = document.querySelector(selector ?? '')
      if (element) {
        element.insertAdjacentHTML(position ?? 'afterbegin', html ?? '')
      }
      res.send()
    })

    this.#receiver.onRequest('document.querySelector', (req, res) => {
      const { selector, deepQuery } = req.body
      const element = this.#querySelector(window, selector, deepQuery)
      res.send(element?.outerHTML || '')
    })

    this.#receiver.onRequest('document.exists', (req, res) => {
      const { selector, deepQuery } = req.body
      const element = this.#querySelector(window, selector, deepQuery)
      res.send(!!element)
    })

    this.#receiver.onRequest('document.remove', (req, res) => {
      const { selector, deepQuery } = req.body
      const result = this.#removeElement(window, selector, deepQuery)
      res.send(result)
    })

    this.#receiver.onRequest('document.addStyles', (req, res) => {
      const { selector, styles: stylesObj, deepQuery } = req.body
      const element = this.#querySelector(window, selector, deepQuery)
      if (element) {
        const originalStyles = element.getAttribute('data-restore-style') || element.getAttribute('style') || ''
        const styles = this.#stringToStyle(originalStyles)
        element.setAttribute('style', this.#styleToString({ ...styles, ...stylesObj }))
        element.setAttribute('data-restore-style', originalStyles)
      }
      res.send()
    })

    this.#receiver.onRequest('document.restoreStyles', (req, res) => {
      const { selector, deepQuery } = req.body
      const element = this.#querySelector(window, selector, deepQuery)
      if (element) {
        const originalStyles = element.getAttribute('data-restore-style') || element.getAttribute('style') || ''
        element.setAttribute('style', originalStyles)
        element.removeAttribute('data-restore-style')
      }
      res.send()
    })

    this.#receiver.onRequest('document.addClasses', (req, res) => {
      const { selector, classes, deepQuery } = req.body
      const element = this.#querySelector(window, selector, deepQuery) as HTMLElement
      if (element) {
        if (!element.hasAttribute('data-restore-class')) {
          element.setAttribute('data-restore-class', element.getAttribute('class') || '')
        }
        const elementClassList = (element.getAttribute('class') || '').trim().split(' ')
        const classesArray = classes.trim().split(' ')
        const newClassesArray = [...new Set([...elementClassList, ...classesArray])]
        element.setAttribute('class', newClassesArray.join(' '))
      }
      res.send()
    })

    this.#receiver.onRequest('document.removeClasses', (req, res) => {
      const { selector, classes, deepQuery } = req.body
      const element = this.#querySelector(window, selector, deepQuery)
      if (element) {
        if (!element.hasAttribute('data-restore-class')) {
          element.setAttribute('data-restore-class', element.getAttribute('class') || '')
        }
        const elementClassList = (element.getAttribute('class') || '').trim().split(' ')
        const classesArray = classes.trim().split(' ')
        const newClassesArray = elementClassList.filter((c: string) => !classesArray.includes(c))
        element.setAttribute('class', newClassesArray.join(' '))
      }
      res.send()
    })

    this.#receiver.onRequest('document.toggleClasses', (req, res) => {
      const { selector, classes, deepQuery } = req.body
      const element = this.#querySelector(window, selector, deepQuery) as HTMLElement
      if (element) {
        if (!element.hasAttribute('data-restore-class')) {
          element.setAttribute('data-restore-class', element.getAttribute('class') || '')
        }
        const elementClassList = (element.getAttribute('class') || '').trim().split(' ')
        const classesArray = classes.trim().split(' ')
        const classesToRemove = elementClassList.filter((c: string) => classesArray.includes(c))
        const classesToAdd = classesArray.filter((c: string) => !elementClassList.includes(c))
        // remove classes
        const newClassesArray = elementClassList.filter((c: string) => !classesToRemove.includes(c))
        // add classes
        newClassesArray.push(...classesToAdd)
        element.setAttribute('class', newClassesArray.join(' '))
      }
      res.send()
    })

    this.#receiver.onRequest('document.restoreClasses', (req, res) => {
      const { selector, deepQuery } = req.body
      const element = this.#querySelector(window, selector, deepQuery)
      if (element) {
        const originalClasses = element.getAttribute('data-restore-class') || element.getAttribute('class') || ''
        element.setAttribute('class', originalClasses)
      }
      res.send()
    })

    this.#receiver.onSubscribe('document.presence', (req, res) => {
      const { selector, options } = req.body
      // special custom event
      let prevElement: any = null
      const handler = async () => {
        try {
          const element = this.#querySelector(window, selector, options?.traverseIframes)
          if (element !== prevElement) {
            prevElement = element
            const data: any = {
              type: 'presence',
              selector,
              target: element
                ? {
                    id: element.id,
                    tagName: element.tagName,
                  }
                : null,
            }
            res.send(data)
          }
        } catch (e) {
          console.log(e)
        }
      }
      this.#handlers.set(req.id, useInterval(handler))
    })

    this.#receiver.onUnsubscribe('document.presence', (req, res) => {
      if (this.#handlers.has(req.id)) {
        this.#handlers.delete(req.id)
      }
      res.send()
    })

    this.#receiver.onSubscribe('document.mutate', (req, res) => {
      const { selector, options } = req.body
      const element = this.#querySelector(window, selector, options?.traverseIframes)
      let timer: any = null
      const handler = () => {
        clearTimeout(timer)
        timer = setTimeout(() => {
          res.send(element.outerHTML)
        })
      }
      const domObserver = new MutationObserver(handler)
      domObserver.observe(element, { childList: true, subtree: true })
      this.#handlers.set(req.id, () => {
        domObserver.disconnect()
      })
    })

    this.#receiver.onUnsubscribe('document.mutate', (req, res) => {
      if (this.#handlers.has(req.id)) {
        this.#handlers.delete(req.id)
      }
      res.send()
    })

    this.#receiver.onSubscribe('document.event', (req, res) => {
      const { selector, event, options } = req.body
      const element = this.#querySelector(window, selector, options?.traverseIframes)
      if (element) {
        const handler = (evt: any) => {
          if (options?.stopPropagation) {
            evt.stopPropagation()
          }
          if (options?.preventDefault) {
            evt.preventDefault()
          }

          const data: any = {
            type: evt.type,
            selector,
            target: {
              id: evt.target.id,
              tagName: evt.target.tagName,
            },
          }
          if (evt.type === 'submit') {
            data.values = this.#processFormValues(evt.currentTarget)
          } else if (evt.type === 'input') {
            data.value = evt.target.value
          } else {
            data.pointerId = evt.pointerId
            data.pointerType = evt.pointerType
            data.clientX = evt.clientX
            data.clientY = evt.clientY
            data.pageX = evt.pageX
            data.pageY = evt.pageY
          }
          res.send(data)
        }

        this.#handlers.set(req.id, () => {
          element.removeEventListener(event, handler)
        })

        element.addEventListener(event, handler)
      }
    })

    this.#receiver.onUnsubscribe('document.event', (req, res) => {
      const { id } = req.body
      if (this.#handlers.has(id)) {
        this.#handlers.delete(id)
      }
      res.send()
    })

    return this
  }

  stop() {
    this.#handlers.forEach(handler => {
      handler()
    })
    this.#handlers.clear()
    this.#receiver.removeAllHandlers(/\bdocument\b/)
  }
}

export const createDocumentReceiver = (receiver: IReceiver) => {
  return new DocumentReceiver(receiver)
}
