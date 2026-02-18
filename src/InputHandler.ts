import { Vector2, View } from '@plume/index'

export class InputHandler {
  private canvas: HTMLCanvasElement
  private view: View
  private onUpdate: () => void

  // pan state
  private isPanning = false
  private lastPanX = 0
  private lastPanY = 0

  // public callbacks
  onClick: ((scenePos: Vector2) => void) | null = null
  onDblClick: ((scenePos: Vector2) => void) | null = null

  // bound handlers (for dispose)
  private handleWheel: (e: WheelEvent) => void
  private handlePointerDown: (e: PointerEvent) => void
  private handlePointerMove: (e: PointerEvent) => void
  private handlePointerUp: (e: PointerEvent) => void
  private handleClick: (e: MouseEvent) => void
  private handleDblClick: (e: MouseEvent) => void

  constructor(canvas: HTMLCanvasElement, view: View, onUpdate: () => void) {
    this.canvas = canvas
    this.view = view
    this.onUpdate = onUpdate

    this.handleWheel = (e: WheelEvent) => {
      e.preventDefault()

      const sceneBefore = this.screenToScene(e.clientX, e.clientY)

      const factor = e.deltaY > 0 ? 1 / 1.1 : 1.1
      this.view.zoom = Math.min(50, Math.max(0.1, this.view.zoom * factor))

      const sceneAfter = this.screenToScene(e.clientX, e.clientY)

      this.view.center = new Vector2(
        this.view.center.x + sceneBefore.x - sceneAfter.x,
        this.view.center.y + sceneBefore.y - sceneAfter.y,
      )

      this.onUpdate()
    }

    this.handlePointerDown = (e: PointerEvent) => {
      if (e.button === 1) {
        this.isPanning = true
        this.lastPanX = e.clientX
        this.lastPanY = e.clientY
        this.canvas.setPointerCapture(e.pointerId)
        e.preventDefault()
      }
    }

    this.handlePointerMove = (e: PointerEvent) => {
      if (!this.isPanning) return
      const dx = e.clientX - this.lastPanX
      const dy = e.clientY - this.lastPanY
      this.view.center = new Vector2(
        this.view.center.x - dx / this.view.zoom,
        this.view.center.y - dy / this.view.zoom,
      )
      this.lastPanX = e.clientX
      this.lastPanY = e.clientY
      this.onUpdate()
    }

    this.handlePointerUp = (e: PointerEvent) => {
      if (e.button === 1) {
        this.isPanning = false
      }
    }

    this.handleClick = (e: MouseEvent) => {
      this.onClick?.(this.screenToScene(e.clientX, e.clientY))
    }

    this.handleDblClick = (e: MouseEvent) => {
      this.onDblClick?.(this.screenToScene(e.clientX, e.clientY))
    }

    this.canvas.addEventListener('wheel', this.handleWheel, { passive: false })
    this.canvas.addEventListener('pointerdown', this.handlePointerDown)
    this.canvas.addEventListener('pointermove', this.handlePointerMove)
    this.canvas.addEventListener('pointerup', this.handlePointerUp)
    this.canvas.addEventListener('click', this.handleClick)
    this.canvas.addEventListener('dblclick', this.handleDblClick)
  }

  screenToScene(screenX: number, screenY: number): Vector2 {
    const rect = this.canvas.getBoundingClientRect()
    const sx = screenX - rect.left
    const sy = screenY - rect.top
    return new Vector2(
      (sx - this.canvas.width / 2) / this.view.zoom + this.view.center.x,
      (sy - this.canvas.height / 2) / this.view.zoom + this.view.center.y,
    )
  }

  dispose(): void {
    this.canvas.removeEventListener('wheel', this.handleWheel)
    this.canvas.removeEventListener('pointerdown', this.handlePointerDown)
    this.canvas.removeEventListener('pointermove', this.handlePointerMove)
    this.canvas.removeEventListener('pointerup', this.handlePointerUp)
    this.canvas.removeEventListener('click', this.handleClick)
    this.canvas.removeEventListener('dblclick', this.handleDblClick)
  }
}
