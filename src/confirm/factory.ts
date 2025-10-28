import { ConfirmElement } from './element.js'

export interface ConfirmOptions {
  header: string
  template: string
}

export async function confirm(message: string, options?: Partial<ConfirmOptions>): Promise<boolean | undefined> {
  const element = document.createElement(ConfirmElement.elementName) as ConfirmElement

  element.message = message
  element.template = options?.template ?? element.template
  element.header = options?.header
  document.body.appendChild(element)

  return element.result
}
