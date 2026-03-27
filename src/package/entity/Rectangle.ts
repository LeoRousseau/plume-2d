import { Vector2 } from '../math/Vector2'
import { BoundingBox } from '../math/BoundingBox'
import type { IRenderer } from '../renderer/IRenderer'
import { AShape } from './Shape'
import { Path } from './Path'
import { Polyline } from './Polyline'
import { distancePointToRectEdge } from '../geometry/distance'

/**
 * An axis-aligned rectangle defined by its top-left origin, width, and height.
 *
 * @example
 * ```ts
 * const r = new Rectangle(new Vector2(10, 20), 200, 100)
 * r.area()      // 20000
 * r.perimeter()  // 600
 * ```
 */
export class Rectangle extends AShape {
  /** Top-left corner. */
  origin: Vector2
  width: number
  height: number

  constructor(origin: Vector2 = new Vector2(), width: number = 1, height: number = 1) {
    super()
    this.origin = origin
    this.width = width
    this.height = height
  }

  draw(renderer: IRenderer): void {
    renderer.drawRectangle(this)
  }

  getBoundingBox(): BoundingBox {
    return new BoundingBox(
      this.origin.clone(),
      new Vector2(this.origin.x + this.width, this.origin.y + this.height),
    )
  }

  /** `width × height` */
  area(): number {
    return this.width * this.height
  }

  /** `2 × (width + height)` */
  perimeter(): number {
    return 2 * (this.width + this.height)
  }

  /** Returns `true` if the point lies inside or on the edge. */
  containsPoint(p: Vector2): boolean {
    return (
      p.x >= this.origin.x &&
      p.x <= this.origin.x + this.width &&
      p.y >= this.origin.y &&
      p.y <= this.origin.y + this.height
    )
  }

  distanceToEdge(p: Vector2): number {
    return distancePointToRectEdge(p, this)
  }

  toPath(): Path {
    const { x, y } = this.origin
    const p = new Path()
      .moveTo(new Vector2(x, y))
      .lineTo(new Vector2(x + this.width, y))
      .lineTo(new Vector2(x + this.width, y + this.height))
      .lineTo(new Vector2(x, y + this.height))
      .close()
    p.stroke = { ...this.stroke }
    p.fill = this.fill ? { ...this.fill } : null
    return p
  }

  /** Converts this rectangle to a closed 4-point {@link Polyline}. */
  toPolyline(): Polyline {
    const { x, y } = this.origin
    return new Polyline(
      [
        new Vector2(x, y),
        new Vector2(x + this.width, y),
        new Vector2(x + this.width, y + this.height),
        new Vector2(x, y + this.height),
      ],
      true,
    )
  }
}
