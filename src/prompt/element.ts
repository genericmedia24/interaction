import { escapeTrap } from '../trap/escape.js'
import { TabTrap } from '../trap/tab.js'
import locales from './locales.json'
import style from './style.css'
import template from './template.html'

export interface PromptLocale {
  cancelButtonText: string
  okButtonText: string
}

export class PromptElement<T = { value: string }> extends HTMLElement {
  static elementName = 'gm-prompt'

  static locales = locales as Record<string, PromptLocale | undefined>

  static template = template

  activeElement?: HTMLElement

  header?: string

  message?: string

  result?: Promise<T | undefined>

  template = PromptElement.template

  value?: string

  connectedCallback(): void {
    this.result = new Promise<T | undefined>((resolve) => {
      const shadowRoot = this.attachShadow({
        mode: 'open',
      })

      shadowRoot.innerHTML = `
        <style>${style}</style>
        ${this.template}
      `

      const dialogElement = this.shadowRoot?.querySelector<HTMLDialogElement>('dialog[part~="dialog"]') ?? null

      if (dialogElement === null) {
        return
      }

      const tabTrap = new TabTrap(dialogElement)

      const locale =
        PromptElement.locales[navigator.language] ??
        PromptElement.locales[navigator.language.split('-').shift() ?? ''] ??
        PromptElement.locales.en ??
        {} as PromptLocale

      dialogElement.addEventListener('close', () => {
        escapeTrap.delete(dialogElement)
        this.remove()
        this.activeElement?.focus()
        resolve(undefined)
      })

      const formElement = dialogElement.querySelector<HTMLFormElement>('form[part~="form"]')

      if (formElement !== null) {
        formElement.addEventListener('submit', (event) => {
          event.preventDefault()
          escapeTrap.delete(dialogElement)
          this.remove()
          this.activeElement?.focus()
          resolve(Object.fromEntries(new FormData(formElement).entries()) as T)
        })
      }

      if (this.header !== undefined) {
        const headerElement = dialogElement.querySelector('slot[name="header"] > *')

        if (headerElement !== null) {
          headerElement.textContent = this.header
        }
      }

      if (this.message !== undefined) {
        const messageElement = dialogElement.querySelector<HTMLElement>('slot[name="message"] > *')

        if (messageElement !== null) {
          messageElement.innerHTML = this.message
        }
      }

      const inputElement = dialogElement.querySelector<HTMLInputElement>('slot[name="input"] > *')

      if (inputElement !== null) {
        if (this.value !== undefined) {
          inputElement.value = this.value
        }

        tabTrap.add(inputElement)
      }

      const buttonSlotElement = dialogElement.querySelector<HTMLSlotElement>('slot[name="button"]')

      if (buttonSlotElement !== null) {
        const cancelButtonElement = (buttonSlotElement.assignedElements() as HTMLElement[]).find((element) => {
          return element.part.contains('cancel')
        }) ?? buttonSlotElement.querySelector<HTMLElement>('[part~="cancel"]')

        if (cancelButtonElement !== null) {
          if (buttonSlotElement.contains(cancelButtonElement)) {
            cancelButtonElement.textContent = locale.cancelButtonText
          }

          cancelButtonElement.addEventListener('click', () => {
            dialogElement.close()
            resolve(undefined)
          })

          tabTrap.add(cancelButtonElement)
        }

        const okButtonElement = (buttonSlotElement.assignedElements() as HTMLElement[]).find((element) => {
          return element.part.contains('ok')
        }) ?? buttonSlotElement.querySelector<HTMLElement>('[part~="ok"]')

        if (okButtonElement !== null) {
          if (buttonSlotElement.contains(okButtonElement)) {
            okButtonElement.textContent = locale.okButtonText
          }

          tabTrap.add(okButtonElement)
        }
      }

      this.activeElement = document.activeElement as HTMLElement
      this.hidden = false
      escapeTrap.add(dialogElement)
      tabTrap.observe()
      dialogElement.showModal()
      dialogElement.focus()
    })
  }
}
