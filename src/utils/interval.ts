import { mitt } from './mitt'

const emitter = mitt()
const hasRequestIdleCallback = typeof window !== 'undefined' && 'requestIdleCallback' in window
const interval = hasRequestIdleCallback ? 500 : 1000
const forceInterval = 5000
const CHANGE = 'change'
let initialized = false
let timer: any

export const useInterval = (callback: () => void) => {
  if (!initialized) {
    initialized = true
    timer = setInterval(() => {
      if (hasRequestIdleCallback) {
        window.requestIdleCallback(
          () => {
            emitter.emit(CHANGE, null)
          },
          {
            timeout: forceInterval,
          }
        )
      } else {
        emitter.emit(CHANGE, null)
      }
    }, interval)
  }

  emitter.on(CHANGE, callback)

  return () => {
    emitter.off(CHANGE, callback)
    if (emitter.all.size === 0) {
      initialized = false
      clearInterval(timer)
    }
  }
}
