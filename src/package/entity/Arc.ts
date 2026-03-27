import { Vector2 } from '../math/Vector2'
import { BoundingBox } from '../math/BoundingBox'
import { TWO_PI, EPSILON } from '../math/constants'
import type { IRenderer } from '../rendering/IRenderer'
import { AShape } from './Shape'

/**
 * A circular arc defined by center, radius, start angle and end angle (in radians).
 *
 * @example
 * ```ts
 * const a = new Arc(new Vector2(100, 100), 50, 0, Math.PI)
 * a.perimeter()  // ~157 (half circumference)
 * a.startPoint() // Vector2(150, 100)
 * ```
 */
export class Arc extends AShape {
  center: Vector2
  radius: number
  /** Start angle in radians. */
  startAngle: number
  /** End angle in radians. */
  endAngle: number

  constructor(
    center: Vector2 = new Vector2(),
    radius: number = 1,
    startAngle: number = 0,
    endAngle: number = Math.PI,
  ) {
    super()
    this.center = center
    this.radius = radius
    this.startAngle = startAngle
    this.endAngle = endAngle
  }

  draw(renderer: IRenderer): void {
    renderer.drawArc(this)
  }

  getBoundingBox(): BoundingBox {
    const points = [this.startPoint(), this.endPoint()]
    const angles = [0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2]
    for (const a of angles) {
      if (this.containsAngle(a)) {
        points.push(new Vector2(
          this.center.x + this.radius * Math.cos(a),
          this.center.y + this.radius * Math.sin(a),
        ))
      }
    }
    return BoundingBox.fromPoints(points)
  }

  /** Perimeter (arc length): `radius × sweep`. */
  perimeter(): number {
    let sweep = this.endAngle - this.startAngle
    if (sweep < 0) sweep += TWO_PI
    return this.radius * sweep
  }

  /** Area of the circular sector defined by this arc. */
  area(): number {
    let sweep = this.endAngle - this.startAngle
    if (sweep < 0) sweep += TWO_PI
    return 0.5 * this.radius * this.radius * sweep
  }

  /** Point at the start of the arc. */
  startPoint(): Vector2 {
    return new Vector2(
      this.center.x + this.radius * Math.cos(this.startAngle),
      this.center.y + this.radius * Math.sin(this.startAngle),
    )
  }

  /** Point at the end of the arc. */
  endPoint(): Vector2 {
    return new Vector2(
      this.center.x + this.radius * Math.cos(this.endAngle),
      this.center.y + this.radius * Math.sin(this.endAngle),
    )
  }

  /**
   * Returns `true` if a point lies on the arc curve within `tolerance` pixels.
   * Checks both distance from center ≈ radius and that the angle falls within the sweep.
   */
  containsPoint(p: Vector2, tolerance: number = 1): boolean {
    const dist = p.distanceTo(this.center)
    if (Math.abs(dist - this.radius) > tolerance) return false
    const angle = Math.atan2(p.y - this.center.y, p.x - this.center.x)
    return this.containsAngle(angle)
  }

  distanceToEdge(p: Vector2): number {
    const dist = p.distanceTo(this.center)
    const angle = Math.atan2(p.y - this.center.y, p.x - this.center.x)
    if (this.containsAngle(angle)) {
      return Math.abs(dist - this.radius)
    }
    return Math.min(p.distanceTo(this.startPoint()), p.distanceTo(this.endPoint()))
  }

  private containsAngle(angle: number): boolean {
    // If sweep covers a full circle or more, every angle is contained
    const sweep = Math.abs(this.endAngle - this.startAngle)
    if (sweep >= TWO_PI - EPSILON) return true

    const normalize = (a: number) => ((a % TWO_PI) + TWO_PI) % TWO_PI
    const start = normalize(this.startAngle)
    const end = normalize(this.endAngle)
    const a = normalize(angle)
    if (start <= end) {
      return a >= start && a <= end
    }
    return a >= start || a <= end
  }
}
