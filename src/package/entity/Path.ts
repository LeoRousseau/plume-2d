import { Vector2 } from '../math/Vector2'
import { BoundingBox } from '../math/BoundingBox'
import type { IRenderer } from '../rendering/IRenderer'
import { AShape } from './Shape'
import type { PathSegment } from './PathSegment'

/**
 * A general-purpose path composed of move, line, quadratic, cubic, and close segments.
 *
 * Supports a fluent builder API:
 * ```ts
 * new Path().moveTo(a).lineTo(b).cubicTo(c1, c2, d).close()
 * ```
 */
export class Path extends AShape {
  segments: PathSegment[]

  constructor(segments: PathSegment[] = []) {
    super()
    this.segments = segments
  }

  draw(renderer: IRenderer): void {
    renderer.drawPath(this)
  }

  /** Bounding box enclosing all segment endpoints and control points. */
  getBoundingBox(): BoundingBox {
    const points: Vector2[] = []
    for (const seg of this.segments) {
      switch (seg.type) {
        case 'moveTo':
        case 'lineTo':
          points.push(seg.point)
          break
        case 'quadraticTo':
          points.push(seg.control, seg.point)
          break
        case 'cubicTo':
          points.push(seg.control1, seg.control2, seg.point)
          break
      }
    }
    return BoundingBox.fromPoints(points)
  }

  /** Total path length (curves are approximated by subdivision). */
  perimeter(): number {
    let total = 0
    let current = new Vector2()
    for (const seg of this.segments) {
      switch (seg.type) {
        case 'moveTo':
          current = seg.point
          break
        case 'lineTo':
          total += current.distanceTo(seg.point)
          current = seg.point
          break
        case 'quadraticTo':
          total += approximateCurveLength(current, seg.control, seg.point)
          current = seg.point
          break
        case 'cubicTo':
          total += approximateCubicLength(current, seg.control1, seg.control2, seg.point)
          current = seg.point
          break
      }
    }
    return total
  }

  /** Area enclosed by the path (only meaningful for closed paths). Uses the shoelace formula on the linearized path. */
  area(): number {
    const points = this.toPolylinePoints()
    if (points.length < 3) return 0
    const last = this.segments[this.segments.length - 1]
    if (!last || last.type !== 'close') return 0

    let sum = 0
    const n = points.length
    for (let i = 0; i < n; i++) {
      const a = points[i]
      const b = points[(i + 1) % n]
      sum += a.x * b.y - b.x * a.y
    }
    return Math.abs(sum) / 2
  }

  /**
   * Point-in-path test using ray-casting on the linearized path.
   * Only returns `true` if the path ends with a `close` segment.
   */
  containsPoint(p: Vector2): boolean {
    const points = this.toPolylinePoints()
    if (points.length < 3) return false
    const last = this.segments[this.segments.length - 1]
    if (!last || last.type !== 'close') return false

    let inside = false
    const n = points.length
    for (let i = 0, j = n - 1; i < n; j = i++) {
      const xi = points[i].x, yi = points[i].y
      const xj = points[j].x, yj = points[j].y
      if ((yi > p.y) !== (yj > p.y) && p.x < ((xj - xi) * (p.y - yi)) / (yj - yi) + xi) {
        inside = !inside
      }
    }
    return inside
  }

  /**
   * Converts this path to an array of points by linearizing all curves.
   * @param steps - Number of subdivisions per curve segment (default 16).
   */
  toPolylinePoints(steps = 16): Vector2[] {
    const points: Vector2[] = []
    let current = new Vector2()
    for (const seg of this.segments) {
      switch (seg.type) {
        case 'moveTo':
          current = seg.point
          points.push(current)
          break
        case 'lineTo':
          current = seg.point
          points.push(current)
          break
        case 'quadraticTo':
          for (let i = 1; i <= steps; i++) {
            const t = i / steps
            const u = 1 - t
            points.push(new Vector2(
              u * u * current.x + 2 * u * t * seg.control.x + t * t * seg.point.x,
              u * u * current.y + 2 * u * t * seg.control.y + t * t * seg.point.y,
            ))
          }
          current = seg.point
          break
        case 'cubicTo':
          for (let i = 1; i <= steps; i++) {
            const t = i / steps
            const u = 1 - t
            points.push(new Vector2(
              u*u*u * current.x + 3*u*u*t * seg.control1.x + 3*u*t*t * seg.control2.x + t*t*t * seg.point.x,
              u*u*u * current.y + 3*u*u*t * seg.control1.y + 3*u*t*t * seg.control2.y + t*t*t * seg.point.y,
            ))
          }
          current = seg.point
          break
        case 'close':
          break
      }
    }
    return points
  }

  // --- Builder API ---

  moveTo(p: Vector2): this {
    this.segments.push({ type: 'moveTo', point: p })
    return this
  }

  lineTo(p: Vector2): this {
    this.segments.push({ type: 'lineTo', point: p })
    return this
  }

  quadraticTo(control: Vector2, point: Vector2): this {
    this.segments.push({ type: 'quadraticTo', control, point })
    return this
  }

  cubicTo(control1: Vector2, control2: Vector2, point: Vector2): this {
    this.segments.push({ type: 'cubicTo', control1, control2, point })
    return this
  }

  close(): this {
    this.segments.push({ type: 'close' })
    return this
  }
}

function approximateCurveLength(p0: Vector2, p1: Vector2, p2: Vector2, steps = 16): number {
  let total = 0
  let prev = p0
  for (let i = 1; i <= steps; i++) {
    const t = i / steps
    const x = (1 - t) * (1 - t) * p0.x + 2 * (1 - t) * t * p1.x + t * t * p2.x
    const y = (1 - t) * (1 - t) * p0.y + 2 * (1 - t) * t * p1.y + t * t * p2.y
    const curr = new Vector2(x, y)
    total += prev.distanceTo(curr)
    prev = curr
  }
  return total
}

function approximateCubicLength(p0: Vector2, p1: Vector2, p2: Vector2, p3: Vector2, steps = 16): number {
  let total = 0
  let prev = p0
  for (let i = 1; i <= steps; i++) {
    const t = i / steps
    const u = 1 - t
    const x = u * u * u * p0.x + 3 * u * u * t * p1.x + 3 * u * t * t * p2.x + t * t * t * p3.x
    const y = u * u * u * p0.y + 3 * u * u * t * p1.y + 3 * u * t * t * p2.y + t * t * t * p3.y
    const curr = new Vector2(x, y)
    total += prev.distanceTo(curr)
    prev = curr
  }
  return total
}
