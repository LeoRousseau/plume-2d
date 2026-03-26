import { Vector2 } from '../math/Vector2'
import { BoundingBox } from '../math/BoundingBox'
import type { IRenderer } from '../rendering/IRenderer'
import { Shape } from './Shape'
import type { PathSegment } from './PathSegment'

export class Path extends Shape {
  segments: PathSegment[]

  constructor(segments: PathSegment[] = []) {
    super()
    this.segments = segments
  }

  draw(renderer: IRenderer): void {
    renderer.drawPath(this)
  }

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

  length(): number {
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

  // Builder API
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
