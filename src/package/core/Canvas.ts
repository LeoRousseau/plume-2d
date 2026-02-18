import { Vector2 } from '../math/Vector2'

export type CanvasEventType = 'click' | 'mousemove' | 'mousedown' | 'mouseup'

export interface CanvasEvent {
  position: Vector2
  original: MouseEvent
}

export type CanvasEventHandler = (event: CanvasEvent) => void

export class Canvas {
  readonly element: HTMLCanvasElement
  readonly ctx: CanvasRenderingContext2D
  private handlers = new Map<CanvasEventType, Set<CanvasEventHandler>>()

  constructor(selector: string, width = 800, height = 600) {
    const el = document.querySelector<HTMLCanvasElement>(selector)
    if (!el) throw new Error(`Canvas element not found: ${selector}`)

    this.element = el
    this.element.width = width
    this.element.height = height

    const ctx = this.element.getContext('2d')
    if (!ctx) throw new Error('Could not get 2D context')
    this.ctx = ctx

    this.setupEvents()
  }

  get width(): number {
    return this.element.width
  }

  get height(): number {
    return this.element.height
  }

  on(type: CanvasEventType, handler: CanvasEventHandler): () => void {
    if (!this.handlers.has(type)) {
      this.handlers.set(type, new Set())
    }
    this.handlers.get(type)!.add(handler)

    return () => this.handlers.get(type)?.delete(handler)
  }

  clear(color = '#1a1a2e'): void {
    this.ctx.fillStyle = color
    this.ctx.fillRect(0, 0, this.width, this.height)
  }

  private setupEvents(): void {
    const types: CanvasEventType[] = ['click', 'mousemove', 'mousedown', 'mouseup']

    for (const type of types) {
      this.element.addEventListener(type, (e: MouseEvent) => {
        const rect = this.element.getBoundingClientRect()
        const event: CanvasEvent = {
          position: new Vector2(e.clientX - rect.left, e.clientY - rect.top),
          original: e,
        }
        this.handlers.get(type)?.forEach((handler) => handler(event))
      })
    }
  }
}
