import { Vector2 } from '../math/Vector2'
import { BoundingBox } from '../math/BoundingBox'
import type { IRenderer } from '../rendering/IRenderer'
import { AShape } from './Shape'
import { distancePointToPolylineEdge } from '../geometry/distance'

/**
 * A shape defined by an ordered list of 2D points.
 * Can be open (polyline) or closed (polygon).
 */
export class Polyline extends AShape {
  points: Vector2[]
  /** If `true`, the last point connects back to the first. */
  isClosed: boolean

  constructor(points: Vector2[] = [], isClosed = false) {
    super()
    this.points = points
    this.isClosed = isClosed
  }

  draw(renderer: IRenderer): void {
    renderer.drawPolyline(this)
  }

  getBoundingBox(): BoundingBox {
    return BoundingBox.fromPoints(this.points)
  }

  /** Total length of all segments (including the closing segment if closed). */
  perimeter(): number {
    let total = 0
    for (let i = 1; i < this.points.length; i++) {
      total += this.points[i].distanceTo(this.points[i - 1])
    }
    if (this.isClosed && this.points.length > 1) {
      total += this.points[this.points.length - 1].distanceTo(this.points[0])
    }
    return total
  }

  /** Number of line segments. */
  segmentCount(): number {
    if (this.points.length < 2) return 0
    return this.isClosed ? this.points.length : this.points.length - 1
  }

  /** Returns the `[start, end]` points of the segment at the given index. */
  segmentAt(index: number): [Vector2, Vector2] {
    const count = this.segmentCount()
    if (index < 0 || index >= count) throw new RangeError(`Segment index ${index} out of range [0, ${count})`)
    const a = this.points[index]
    const b = this.points[(index + 1) % this.points.length]
    return [a, b]
  }

  /**
   * Returns the point located at the given distance along the polyline path.
   * Clamps to the start or end if `d` is out of range.
   */
  pointAtDistance(d: number): Vector2 {
    if (this.points.length === 0) throw new Error('Empty polyline')
    if (this.points.length === 1) return this.points[0].clone()
    if (d <= 0) return this.points[0].clone()

    let remaining = d
    const count = this.segmentCount()
    for (let i = 0; i < count; i++) {
      const [a, b] = this.segmentAt(i)
      const segLen = a.distanceTo(b)
      if (remaining <= segLen) {
        const t = segLen === 0 ? 0 : remaining / segLen
        return a.add(b.sub(a).scale(t))
      }
      remaining -= segLen
    }
    return this.isClosed ? this.points[0].clone() : this.points[this.points.length - 1].clone()
  }

  /** Signed area using the shoelace formula. Returns 0 if not closed or fewer than 3 points. */
  area(): number {
    if (!this.isClosed || this.points.length < 3) return 0
    let sum = 0
    const n = this.points.length
    for (let i = 0; i < n; i++) {
      const a = this.points[i]
      const b = this.points[(i + 1) % n]
      sum += a.x * b.y - b.x * a.y
    }
    return Math.abs(sum) / 2
  }

  /** Average of all vertices. */
  centroid(): Vector2 {
    if (this.points.length === 0) return new Vector2()
    let cx = 0, cy = 0
    for (const p of this.points) {
      cx += p.x
      cy += p.y
    }
    return new Vector2(cx / this.points.length, cy / this.points.length)
  }

  /**
   * Ray-casting point-in-polygon test.
   * Always returns `false` for open polylines.
   */
  containsPoint(p: Vector2): boolean {
    if (!this.isClosed || this.points.length < 3) return false
    let inside = false
    const n = this.points.length
    for (let i = 0, j = n - 1; i < n; j = i++) {
      const xi = this.points[i].x, yi = this.points[i].y
      const xj = this.points[j].x, yj = this.points[j].y
      if ((yi > p.y) !== (yj > p.y) && p.x < ((xj - xi) * (p.y - yi)) / (yj - yi) + xi) {
        inside = !inside
      }
    }
    return inside
  }

  distanceToEdge(p: Vector2): number {
    return distancePointToPolylineEdge(p, this)
  }

  /**
   * Returns a simplified copy using the Douglas-Peucker algorithm.
   * @param tolerance - Maximum allowed perpendicular distance.
   */
  simplify(tolerance: number): Polyline {
    if (this.points.length <= 2) return new Polyline([...this.points], this.isClosed)
    const kept = douglasPeucker(this.points, tolerance)
    const result = new Polyline(kept, this.isClosed)
    result.stroke = { ...this.stroke }
    result.fill = this.fill ? { ...this.fill } : null
    return result
  }

  /** Returns a new polyline with the point order reversed. */
  reverse(): Polyline {
    const result = new Polyline([...this.points].reverse(), this.isClosed)
    result.stroke = { ...this.stroke }
    result.fill = this.fill ? { ...this.fill } : null
    return result
  }
}

function douglasPeucker(points: Vector2[], tolerance: number): Vector2[] {
  if (points.length <= 2) return [...points]

  let maxDist = 0
  let maxIndex = 0
  const first = points[0]
  const last = points[points.length - 1]

  for (let i = 1; i < points.length - 1; i++) {
    const d = perpendicularDistance(points[i], first, last)
    if (d > maxDist) {
      maxDist = d
      maxIndex = i
    }
  }

  if (maxDist > tolerance) {
    const left = douglasPeucker(points.slice(0, maxIndex + 1), tolerance)
    const right = douglasPeucker(points.slice(maxIndex), tolerance)
    return [...left.slice(0, -1), ...right]
  }

  return [first, last]
}

function perpendicularDistance(point: Vector2, lineStart: Vector2, lineEnd: Vector2): number {
  const dx = lineEnd.x - lineStart.x
  const dy = lineEnd.y - lineStart.y
  const lengthSq = dx * dx + dy * dy
  if (lengthSq === 0) return point.distanceTo(lineStart)
  const num = Math.abs(dy * point.x - dx * point.y + lineEnd.x * lineStart.y - lineEnd.y * lineStart.x)
  return num / Math.sqrt(lengthSq)
}
