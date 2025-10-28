import { NotifyElement } from './element.js'

export interface NotifyOptions {
  showCloseButton: boolean
  template: string
  timeout: number
}

export function notify(message: string, options?: Partial<NotifyOptions>): HTMLElement {
  const element = document.createElement(NotifyElement.elementName) as NotifyElement

  element.message = message
  element.showCloseButton = options?.showCloseButton ?? element.showCloseButton
  element.template = options?.template ?? element.template
  element.timeout = options?.timeout ?? element.timeout

  NotifyElement.stack.push(() => {
    document.body.appendChild(element)
  })

  if (NotifyElement.current === undefined) {
    NotifyElement.current = NotifyElement.stack.shift()
    NotifyElement.current?.()
  }

  return element
}
