import { AlertElement } from './element.js'

export interface AlertOptions {
  header: string
  template: string
}

export async function alert(message: string, options?: Partial<AlertOptions>): Promise<void> {
  const element = document.createElement(AlertElement.elementName) as AlertElement

  element.message = message
  element.template = options?.template ?? element.template
  element.header = options?.header
  document.body.appendChild(element)

  return element.result
}
