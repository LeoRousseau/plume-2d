import { Vector2, View } from '@plume/index'

export class InputHandler {
  private canvas: HTMLCanvasElement
  private view: View
  private onUpdate: () => void

  // pan state
  private isPanning = false
  private lastPanX = 0
  private lastPanY = 0

  // drag state
  private isDragging = false
  private dragButton = -1
  private dragStartScreen: { x: number; y: number } = { x: 0, y: 0 }

  // public callbacks
  onClick: ((scenePos: Vector2) => void) | null = null
  onDblClick: ((scenePos: Vector2) => void) | null = null
  onMouseMove: ((scenePos: Vector2) => void) | null = null
  onMouseDown: ((scenePos: Vector2) => void) | null = null
  onMouseUp: ((scenePos: Vector2) => void) | null = null
  onDrag: ((scenePos: Vector2) => void) | null = null

  // bound handlers (for dispose)
  private handleWheel: (e: WheelEvent) => void
  private handlePointerDown: (e: PointerEvent) => void
  private handlePointerMove: (e: PointerEvent) => void
  private handlePointerUp: (e: PointerEvent) => void
  private handleDblClick: (e: MouseEvent) => void
  private handleMouseMove: (e: MouseEvent) => void

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
      } else if (e.button === 0) {
        this.isDragging = true
        this.dragButton = 0
        this.dragStartScreen = { x: e.clientX, y: e.clientY }
        this.canvas.setPointerCapture(e.pointerId)
        this.onMouseDown?.(this.screenToScene(e.clientX, e.clientY))
      }
    }

    this.handlePointerMove = (e: PointerEvent) => {
      if (this.isPanning) {
        const dx = e.clientX - this.lastPanX
        const dy = e.clientY - this.lastPanY
        this.view.center = new Vector2(
          this.view.center.x - dx / this.view.zoom,
          this.view.center.y - dy / this.view.zoom,
        )
        this.lastPanX = e.clientX
        this.lastPanY = e.clientY
        this.onUpdate()
      } else if (this.isDragging) {
        this.onDrag?.(this.screenToScene(e.clientX, e.clientY))
      }
      this.onMouseMove?.(this.screenToScene(e.clientX, e.clientY))
    }

    this.handlePointerUp = (e: PointerEvent) => {
      if (e.button === 1) {
        this.isPanning = false
      } else if (e.button === 0 && this.isDragging) {
        this.isDragging = false
        this.dragButton = -1
        const scenePos = this.screenToScene(e.clientX, e.clientY)
        this.onMouseUp?.(scenePos)
        // Fire onClick only if drag distance was negligible (click, not drag)
        const dx = e.clientX - this.dragStartScreen.x
        const dy = e.clientY - this.dragStartScreen.y
        if (Math.sqrt(dx * dx + dy * dy) < 3) {
          this.onClick?.(scenePos)
        }
      }
    }

    this.handleDblClick = (e: MouseEvent) => {
      this.onDblClick?.(this.screenToScene(e.clientX, e.clientY))
    }

    this.handleMouseMove = (e: MouseEvent) => {
      this.onMouseMove?.(this.screenToScene(e.clientX, e.clientY))
    }

    this.canvas.addEventListener('wheel', this.handleWheel, { passive: false })
    this.canvas.addEventListener('pointerdown', this.handlePointerDown)
    this.canvas.addEventListener('pointermove', this.handlePointerMove)
    this.canvas.addEventListener('pointerup', this.handlePointerUp)
    this.canvas.addEventListener('dblclick', this.handleDblClick)
    this.canvas.addEventListener('mousemove', this.handleMouseMove)
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
    this.canvas.removeEventListener('dblclick', this.handleDblClick)
    this.canvas.removeEventListener('mousemove', this.handleMouseMove)
  }
}
