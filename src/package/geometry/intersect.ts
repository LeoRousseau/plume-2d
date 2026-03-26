import { Vector2 } from '../math/Vector2'
import type { Circle } from '../core/Circle'
import type { BoundingBox } from '../math/BoundingBox'

export function intersectLineLine(
  a1: Vector2, a2: Vector2,
  b1: Vector2, b2: Vector2,
): Vector2 | null {
  const d1 = a2.sub(a1)
  const d2 = b2.sub(b1)
  const cross = Vector2.cross(d1, d2)
  if (Math.abs(cross) < 1e-10) return null

  const d = b1.sub(a1)
  const t = Vector2.cross(d, d2) / cross
  const u = Vector2.cross(d, d1) / cross

  if (t >= 0 && t <= 1 && u >= 0 && u <= 1) {
    return a1.add(d1.scale(t))
  }
  return null
}

export function intersectLineCircle(
  lineStart: Vector2, lineEnd: Vector2,
  circle: { center: Vector2; radius: number },
): Vector2[] {
  const d = lineEnd.sub(lineStart)
  const f = lineStart.sub(circle.center)
  const a = d.dot(d)
  const b = 2 * f.dot(d)
  const c = f.dot(f) - circle.radius * circle.radius
  let discriminant = b * b - 4 * a * c

  if (discriminant < 0) return []

  const results: Vector2[] = []
  discriminant = Math.sqrt(discriminant)

  const t1 = (-b - discriminant) / (2 * a)
  const t2 = (-b + discriminant) / (2 * a)

  if (t1 >= 0 && t1 <= 1) results.push(lineStart.add(d.scale(t1)))
  if (t2 >= 0 && t2 <= 1 && Math.abs(t2 - t1) > 1e-10) results.push(lineStart.add(d.scale(t2)))

  return results
}

export function intersectCircleCircle(
  c1: { center: Vector2; radius: number },
  c2: { center: Vector2; radius: number },
): Vector2[] {
  const d = c2.center.distanceTo(c1.center)
  if (d > c1.radius + c2.radius || d < Math.abs(c1.radius - c2.radius) || d === 0) return []

  const a = (c1.radius * c1.radius - c2.radius * c2.radius + d * d) / (2 * d)
  const h = Math.sqrt(c1.radius * c1.radius - a * a)
  const dir = c2.center.sub(c1.center).scale(1 / d)
  const mid = c1.center.add(dir.scale(a))
  const perp = new Vector2(-dir.y, dir.x)

  if (Math.abs(h) < 1e-10) return [mid]
  return [mid.add(perp.scale(h)), mid.add(perp.scale(-h))]
}

export function intersectsAABB(a: BoundingBox, b: BoundingBox): boolean {
  return a.intersects(b)
}
