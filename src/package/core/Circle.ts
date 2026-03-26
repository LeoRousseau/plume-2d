import { Vector2 } from '../math/Vector2'
import { BoundingBox } from '../math/BoundingBox'
import type { IRenderer } from '../rendering/IRenderer'
import { Shape } from './Shape'

export class Circle extends Shape {
  center: Vector2
  radius: number

  constructor(center: Vector2 = new Vector2(), radius: number = 1) {
    super()
    this.center = center
    this.radius = radius
  }

  draw(renderer: IRenderer): void {
    renderer.drawCircle(this)
  }

  getBoundingBox(): BoundingBox {
    return new BoundingBox(
      new Vector2(this.center.x - this.radius, this.center.y - this.radius),
      new Vector2(this.center.x + this.radius, this.center.y + this.radius),
    )
  }

  area(): number {
    return Math.PI * this.radius * this.radius
  }

  circumference(): number {
    return 2 * Math.PI * this.radius
  }

  containsPoint(p: Vector2): boolean {
    return p.distanceTo(this.center) <= this.radius
  }
}
