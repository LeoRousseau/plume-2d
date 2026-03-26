import { Vector2 } from '../math/Vector2'
import { BoundingBox } from '../math/BoundingBox'
import type { IRenderer } from '../rendering/IRenderer'
import { Shape } from './Shape'

/** A circle defined by a center point and radius. */
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

  /** `π r²` */
  area(): number {
    return Math.PI * this.radius * this.radius
  }

  /** `2 π r` */
  circumference(): number {
    return 2 * Math.PI * this.radius
  }

  /** Returns `true` if the point lies inside or on the circle. */
  containsPoint(p: Vector2): boolean {
    return p.distanceTo(this.center) <= this.radius
  }
}
