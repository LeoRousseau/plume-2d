import { Vector2 } from './Vector2'

/**
 * Axis-aligned bounding box defined by min and max corners.
 *
 * Uses screen coordinates: min is top-left, max is bottom-right (Y-down).
 *
 * @example
 * ```ts
 * const bb = BoundingBox.fromPoints([new Vector2(0, 0), new Vector2(100, 50)])
 * bb.width    // 100
 * bb.height   // 50
 * bb.center() // Vector2(50, 25)
 * ```
 */
export class BoundingBox {
  constructor(
    /** Bottom-left corner (minimum x/y). */
    public min: Vector2,
    /** Top-right corner (maximum x/y). */
    public max: Vector2,
  ) {}

  /** Width of the box (`max.x - min.x`). */
  get width(): number {
    return this.max.x - this.min.x
  }

  /** Height of the box (`max.y - min.y`). */
  get height(): number {
    return this.max.y - this.min.y
  }

  /** Center point of the box. */
  center(): Vector2 {
    return new Vector2(
      (this.min.x + this.max.x) / 2,
      (this.min.y + this.max.y) / 2,
    )
  }

  /** Returns `true` if the point lies inside or on the edge of this box. */
  containsPoint(p: Vector2): boolean {
    return p.x >= this.min.x && p.x <= this.max.x && p.y >= this.min.y && p.y <= this.max.y
  }

  /** Returns `true` if this box overlaps `other`. */
  intersects(other: BoundingBox): boolean {
    return (
      this.min.x <= other.max.x &&
      this.max.x >= other.min.x &&
      this.min.y <= other.max.y &&
      this.max.y >= other.min.y
    )
  }

  /** Returns the smallest box containing both `this` and `other`. */
  union(other: BoundingBox): BoundingBox {
    return new BoundingBox(
      new Vector2(Math.min(this.min.x, other.min.x), Math.min(this.min.y, other.min.y)),
      new Vector2(Math.max(this.max.x, other.max.x), Math.max(this.max.y, other.max.y)),
    )
  }

  /** Returns the smallest box containing `this` and the given point. */
  expand(point: Vector2): BoundingBox {
    return new BoundingBox(
      new Vector2(Math.min(this.min.x, point.x), Math.min(this.min.y, point.y)),
      new Vector2(Math.max(this.max.x, point.x), Math.max(this.max.y, point.y)),
    )
  }

  /** Returns a new box expanded by `amount` on every side. */
  pad(amount: number): BoundingBox {
    return new BoundingBox(
      new Vector2(this.min.x - amount, this.min.y - amount),
      new Vector2(this.max.x + amount, this.max.y + amount),
    )
  }

  /** Returns an empty (inverted) bounding box. Useful as an accumulator starting value. */
  static empty(): BoundingBox {
    return new BoundingBox(
      new Vector2(Infinity, Infinity),
      new Vector2(-Infinity, -Infinity),
    )
  }

  /** Creates the tightest AABB enclosing all given points. */
  static fromPoints(points: Vector2[]): BoundingBox {
    if (points.length === 0) return BoundingBox.empty()
    let minX = Infinity,
      minY = Infinity,
      maxX = -Infinity,
      maxY = -Infinity
    for (const p of points) {
      if (p.x < minX) minX = p.x
      if (p.y < minY) minY = p.y
      if (p.x > maxX) maxX = p.x
      if (p.y > maxY) maxY = p.y
    }
    return new BoundingBox(new Vector2(minX, minY), new Vector2(maxX, maxY))
  }
}
