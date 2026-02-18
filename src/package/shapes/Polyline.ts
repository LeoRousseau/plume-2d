import { Vector2 } from '../math/Vector2'
import type { IRenderer } from '../rendering/IRenderer'
import { Shape } from './Shape'

export class Polyline extends Shape {
  points: Vector2[]
  isClosed: boolean

  constructor(points: Vector2[] = [], isClosed = false) {
    super()
    this.points = points
    this.isClosed = isClosed
  }

  draw(renderer: IRenderer): void {
    renderer.drawPolyline(this)
  }
}
