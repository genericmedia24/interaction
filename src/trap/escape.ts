declare global {
  interface Window {
    escapeTrap: EscapeTrap
  }
}

export class EscapeTrap {
  static get instance(): EscapeTrap {
    if (typeof window.escapeTrap === 'undefined') {
      window.escapeTrap = new EscapeTrap()
    }

    return window.escapeTrap
  }

  #handleKeydownBound = this.#handleKeydown.bind(this)

  #stack: HTMLElement[] = []

  add(element: HTMLElement): void {
    this.#stack.push(element)
  }

  delete(element: HTMLElement): void {
    const index = this.#stack.indexOf(element)

    if (index > -1) {
      this.#stack.splice(index, 1)
    }
  }

  disconnect(): void {
    window.removeEventListener('keydown', this.#handleKeydownBound)
  }

  observe(): void {
    window.addEventListener('keydown', this.#handleKeydownBound)
  }

  #handleKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      event.preventDefault()

      const element = this.#stack.pop()

      if (element instanceof HTMLElement) {
        if (element instanceof HTMLDialogElement) {
          element.close()
        } else {
          element.hidePopover()
        }
      }
    }
  }
}

export const escapeTrap = EscapeTrap.instance
