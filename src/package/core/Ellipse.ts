import { Vector2 } from '../math/Vector2'
import { BoundingBox } from '../math/BoundingBox'
import type { IRenderer } from '../rendering/IRenderer'
import { Shape } from './Shape'

export class Ellipse extends Shape {
  center: Vector2
  rx: number
  ry: number

  constructor(center: Vector2 = new Vector2(), rx: number = 1, ry: number = 1) {
    super()
    this.center = center
    this.rx = rx
    this.ry = ry
  }

  draw(renderer: IRenderer): void {
    renderer.drawEllipse(this)
  }

  getBoundingBox(): BoundingBox {
    return new BoundingBox(
      new Vector2(this.center.x - this.rx, this.center.y - this.ry),
      new Vector2(this.center.x + this.rx, this.center.y + this.ry),
    )
  }

  area(): number {
    return Math.PI * this.rx * this.ry
  }

  perimeter(): number {
    // Ramanujan approximation
    const a = this.rx
    const b = this.ry
    const h = ((a - b) * (a - b)) / ((a + b) * (a + b))
    return Math.PI * (a + b) * (1 + (3 * h) / (10 + Math.sqrt(4 - 3 * h)))
  }

  containsPoint(p: Vector2): boolean {
    const dx = p.x - this.center.x
    const dy = p.y - this.center.y
    return (dx * dx) / (this.rx * this.rx) + (dy * dy) / (this.ry * this.ry) <= 1
  }
}
