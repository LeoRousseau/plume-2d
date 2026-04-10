import { Vector2 } from '../math/Vector2'
import { BoundingBox } from '../math/BoundingBox'
import type { IRenderer } from '../renderer/IRenderer'
import { AShape } from './Shape'
import { Path } from './Path'

/**
 * A circle defined by a center point and radius.
 *
 * @example
 * ```ts
 * const c = new Circle(new Vector2(100, 100), 50)
 * c.stroke = { color: '#0ff', width: 2 }
 * c.fill = { type: 'solid', color: 'rgba(0,255,255,0.2)' }
 * c.area()      // ~7854
 * c.perimeter()  // ~314
 * ```
 */
export class Circle extends AShape {
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
  perimeter(): number {
    return 2 * Math.PI * this.radius
  }

  /** Returns `true` if the point lies inside or on the circle. */
  containsPoint(p: Vector2): boolean {
    return p.distanceTo(this.center) <= this.radius
  }

  distanceToEdge(p: Vector2): number {
    return Math.abs(p.distanceTo(this.center) - this.radius)
  }

  toPath(): Path {
    const k = 0.5522847498 // 4/3 * (√2 - 1)
    const cx = this.center.x, cy = this.center.y, r = this.radius
    const p = new Path()
      .moveTo(new Vector2(cx + r, cy))
      .cubicTo(new Vector2(cx + r, cy + r * k), new Vector2(cx + r * k, cy + r), new Vector2(cx, cy + r))
      .cubicTo(new Vector2(cx - r * k, cy + r), new Vector2(cx - r, cy + r * k), new Vector2(cx - r, cy))
      .cubicTo(new Vector2(cx - r, cy - r * k), new Vector2(cx - r * k, cy - r), new Vector2(cx, cy - r))
      .cubicTo(new Vector2(cx + r * k, cy - r), new Vector2(cx + r, cy - r * k), new Vector2(cx + r, cy))
      .close()
    p.stroke = { ...this.stroke }
    p.fill = this.fill ? { ...this.fill } : null
    return p
  }
}
