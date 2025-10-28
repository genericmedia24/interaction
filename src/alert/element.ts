import { escapeTrap } from '../trap/escape.js'
import { TabTrap } from '../trap/tab.js'
import locales from './locales.json'
import style from './style.css'
import template from './template.html'

export interface AlertLocale {
  okButtonText: string
}

export class AlertElement extends HTMLElement {
  static elementName = 'gm-alert'

  static locales = locales as Record<string, AlertLocale | undefined>

  static template = template

  activeElement?: HTMLElement

  header?: string

  message?: string

  result?: Promise<void>

  template = AlertElement.template

  connectedCallback(): void {
    this.result = new Promise<void>((resolve) => {
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
        AlertElement.locales[navigator.language] ??
        AlertElement.locales[navigator.language.split('-').shift() ?? ''] ??
        AlertElement.locales.en ??
        {} as AlertLocale

      dialogElement.addEventListener('close', () => {
        escapeTrap.delete(dialogElement)
        this.remove()
        this.activeElement?.focus()
        resolve()
      })

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

      const buttonSlotElement = dialogElement.querySelector<HTMLSlotElement>('slot[name="button"]')

      if (buttonSlotElement !== null) {
        const okButtonElement = (buttonSlotElement.assignedElements() as HTMLElement[]).find((element) => {
          return element.part.contains('ok')
        }) ?? buttonSlotElement.querySelector<HTMLElement>('[part~="ok"]')

        if (okButtonElement !== null) {
          if (buttonSlotElement.contains(okButtonElement)) {
            okButtonElement.textContent = locale.okButtonText
          }

          okButtonElement.addEventListener('click', () => {
            dialogElement.close()
            resolve()
          })

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
