import { PromptElement } from './element.js'

export interface PromptOptions {
  header: string
  template: string
  value: string
}

export async function prompt<T = { value: string }>(message: string, options?: Partial<PromptOptions>): Promise<T | undefined> {
  const element = document.createElement(PromptElement.elementName) as PromptElement<T>

  element.message = message
  element.template = options?.template ?? element.template
  element.value = options?.value
  element.header = options?.header
  document.body.appendChild(element)

  return element.result
}
