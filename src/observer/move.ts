export interface MoveEvent {
  clientX: number
  clientX0: number
  clientY: number
  clientY0: number
  dx: number
  dy: number
  t0: number
}

export class MoveObserver {
  #callback: (event: MoveEvent) => void

  #firstEvent?: PointerEvent

  #handlePointerDownBound = this.#handlePointerDown.bind(this)

  #handlePointerMoveBound = this.#handlePointerMove.bind(this)

  #handlePointerUpBound = this.#handlePointerUp.bind(this)

  #lastEvent?: PointerEvent

  #parentElement?: HTMLElement

  #targetElement!: HTMLElement

  constructor(callback: (event: MoveEvent) => void) {
    this.#callback = callback
  }

  disconnect(): void {
    this.#targetElement.removeEventListener('pointerdown', this.#handlePointerDownBound)
  }

  observe(targetElement: HTMLElement, parentElement?: HTMLElement): void {
    this.#targetElement = targetElement
    this.#parentElement = parentElement
    this.#targetElement.addEventListener('pointerdown', this.#handlePointerDownBound)
  }

  #handlePointerDown(event: PointerEvent): void {
    this.#firstEvent = event
    window.addEventListener('pointermove', this.#handlePointerMoveBound)
    window.addEventListener('pointerup', this.#handlePointerUpBound)
  }

  #handlePointerMove(event: PointerEvent): void {
    if (this.#firstEvent === undefined) {
      return
    }

    const moveEvent = {
      clientX: event.clientX,
      clientX0: this.#firstEvent.clientX,
      clientY: event.clientY,
      clientY0: this.#firstEvent.clientY,
      dx: event.clientX - (this.#lastEvent?.clientX ?? event.clientX),
      dy: event.clientY - (this.#lastEvent?.clientY ?? event.clientY),
      t0: this.#firstEvent.timeStamp,
    }

    this.#lastEvent = event

    if (this.#parentElement === undefined) {
      this.#callback(moveEvent)
    } else {
      const parentRect = this.#parentElement.getBoundingClientRect()
      const targetRect = this.#targetElement.getBoundingClientRect()

      if (
        event.clientX < parentRect.left + (targetRect.width / 2) ||
        targetRect.left + moveEvent.dx < parentRect.left
      ) {
        moveEvent.dx = parentRect.left - targetRect.left
      } else if (
        event.clientX > parentRect.right - (targetRect.width / 2) ||
        targetRect.left + moveEvent.dx + targetRect.width > parentRect.right
      ) {
        moveEvent.dx = parentRect.right - targetRect.right
      }

      if (
        event.clientY < parentRect.top + (targetRect.height / 2) ||
        targetRect.top + moveEvent.dy < parentRect.top
      ) {
        moveEvent.dy = parentRect.top - targetRect.top
      } else if (
        event.clientY > parentRect.bottom - (targetRect.height / 2) ||
        targetRect.top + moveEvent.dy + targetRect.height > parentRect.bottom
      ) {
        moveEvent.dy = parentRect.bottom - targetRect.bottom
      }

      this.#callback(moveEvent)
    }
  }

  #handlePointerUp(): void {
    this.#firstEvent = undefined
    this.#lastEvent = undefined
    window.removeEventListener('pointermove', this.#handlePointerMoveBound)
    window.removeEventListener('pointerup', this.#handlePointerUpBound)
  }
}
