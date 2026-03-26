import { Vector2 } from '../math/Vector2'
import type { Polyline } from '../core/Polyline'
import type { Circle } from '../core/Circle'

export function closestPointOnLine(point: Vector2, lineStart: Vector2, lineEnd: Vector2): Vector2 {
  const ab = lineEnd.sub(lineStart)
  const lengthSq = ab.dot(ab)
  if (lengthSq === 0) return lineStart.clone()
  const t = Math.max(0, Math.min(1, point.sub(lineStart).dot(ab) / lengthSq))
  return lineStart.add(ab.scale(t))
}

export function distancePointToLine(point: Vector2, lineStart: Vector2, lineEnd: Vector2): number {
  return point.distanceTo(closestPointOnLine(point, lineStart, lineEnd))
}

export function closestPointOnPolyline(point: Vector2, polyline: Polyline): Vector2 {
  let bestDist = Infinity
  let bestPoint = polyline.points[0] ?? new Vector2()
  const count = polyline.segmentCount()
  for (let i = 0; i < count; i++) {
    const [a, b] = polyline.segmentAt(i)
    const cp = closestPointOnLine(point, a, b)
    const d = point.distanceTo(cp)
    if (d < bestDist) {
      bestDist = d
      bestPoint = cp
    }
  }
  return bestPoint
}

export function distancePointToPolyline(point: Vector2, polyline: Polyline): number {
  return point.distanceTo(closestPointOnPolyline(point, polyline))
}

export function distancePointToCircle(point: Vector2, circle: Circle): number {
  return Math.abs(point.distanceTo(circle.center) - circle.radius)
}
