import { ISender } from "@mallpopstar/partyline"

class ErrorSender {
  constructor(private sender: ISender) {}

  subscribe(callback: (error: { message: string, stack: string }) => void) {
    return this.sender.subscribe('error', callback)
  }
}

export const createErrorSender = (sender: ISender) => {
  return new ErrorSender(sender)
}
