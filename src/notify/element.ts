import { escapeTrap } from '../trap/escape.js'
import locales from './locales.json'
import style from './style.css'
import template from './template.html'

export interface NotifyLocale {
  closeButtonLabel: string
}

export class NotifyElement extends HTMLElement {
  static activeElement?: HTMLElement

  static current = undefined as (() => void) | undefined

  static elementName = 'gm-notify'

  static locales = locales as Record<string, NotifyLocale | undefined>

  static showCloseButton = true

  static stack = [] as Array<() => void>

  static template = template

  static timeout = 5000

  message?: string

  showCloseButton = NotifyElement.showCloseButton

  template = NotifyElement.template

  timeout = NotifyElement.timeout

  connectedCallback(): void {
    const shadowRoot = this.attachShadow({
      mode: 'open',
    })

    shadowRoot.innerHTML = `
      <style>${style}</style>
      ${NotifyElement.template}
    `

    const popoverElement = this.shadowRoot?.querySelector<HTMLElement>('[part~="popover"]') ?? null

    if (popoverElement === null) {
      return
    }

    popoverElement.addEventListener('toggle', (event) => {
      if (event.newState === 'closed') {
        escapeTrap.delete(popoverElement)
        this.remove()
        NotifyElement.current = NotifyElement.stack.shift()
        NotifyElement.current?.()

        if (NotifyElement.current === undefined) {
          NotifyElement.activeElement?.focus()
          NotifyElement.activeElement = undefined
        }
      }
    })

    const locale =
      NotifyElement.locales[navigator.language] ??
      NotifyElement.locales[navigator.language.split('-').shift() ?? ''] ??
      NotifyElement.locales.en ??
      {} as NotifyLocale

    if (this.message !== undefined) {
      const messageElement = popoverElement.querySelector<HTMLElement>('slot[name="message"] > *')

      if (messageElement !== null) {
        messageElement.innerHTML = this.message
      }
    }

    const buttonSlotElement = popoverElement.querySelector<HTMLSlotElement>('slot[name="button"]')

    if (buttonSlotElement !== null) {
      const closeButtonElement = (buttonSlotElement.assignedElements() as HTMLElement[]).find((element) => {
        return element.part.contains('close')
      }) ?? buttonSlotElement.querySelector<HTMLElement>('[part~="close"]')

      if (closeButtonElement !== null) {
        const showCloseButton = Boolean(this.dataset.showCloseButton ?? this.showCloseButton)

        if (showCloseButton) {
          if (buttonSlotElement.contains(closeButtonElement)) {
            closeButtonElement.setAttribute('aria-label', locale.closeButtonLabel)
          }

          closeButtonElement.addEventListener('click', () => {
            popoverElement.hidePopover()
          })
        } else {
          closeButtonElement.remove()
        }
      }
    }

    const timeout = Number(this.dataset.timeout ?? this.timeout)

    if (timeout !== -1) {
      window.setTimeout(() => {
        popoverElement.hidePopover()
      }, timeout)
    }

    NotifyElement.activeElement ??= document.activeElement as HTMLElement
    this.hidden = false
    escapeTrap.add(popoverElement)
    popoverElement.showPopover()

    window.setTimeout(() => {
      popoverElement.focus()
    }, 50)
  }
}
