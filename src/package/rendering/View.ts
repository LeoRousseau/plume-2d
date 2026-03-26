import { Vector2 } from '../math/Vector2'

/** Camera / viewport that controls what portion of the scene is visible. */
export class View {
  /** Center point the camera is looking at (in scene coordinates). */
  center: Vector2
  /** Viewport width in pixels. */
  width: number
  /** Viewport height in pixels. */
  height: number
  /** Zoom factor (1 = no zoom, > 1 = zoomed in). */
  zoom: number

  constructor(width: number, height: number) {
    this.center = new Vector2(width / 2, height / 2)
    this.width = width
    this.height = height
    this.zoom = 1
  }
}
