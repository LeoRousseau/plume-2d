import { Vector2 } from '../math/Vector2'

export class View {
  center: Vector2
  width: number
  height: number
  zoom: number

  constructor(width: number, height: number) {
    this.center = new Vector2(width / 2, height / 2)
    this.width = width
    this.height = height
    this.zoom = 1
  }
}
