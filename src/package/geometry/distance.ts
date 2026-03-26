import { Vector2 } from '../math/Vector2'
import type { Polyline } from '../entity/Polyline'
import type { Circle } from '../entity/Circle'
import type { Rectangle } from '../entity/Rectangle'
import type { Path } from '../entity/Path'

/** Returns the closest point on a line segment `[lineStart, lineEnd]` to `point`. */
export function closestPointOnLine(point: Vector2, lineStart: Vector2, lineEnd: Vector2): Vector2 {
  const ab = lineEnd.sub(lineStart)
  const lengthSq = ab.dot(ab)
  if (lengthSq === 0) return lineStart.clone()
  const t = Math.max(0, Math.min(1, point.sub(lineStart).dot(ab) / lengthSq))
  return lineStart.add(ab.scale(t))
}

/** Shortest distance from `point` to the line segment `[lineStart, lineEnd]`. */
export function distancePointToLine(point: Vector2, lineStart: Vector2, lineEnd: Vector2): number {
  return point.distanceTo(closestPointOnLine(point, lineStart, lineEnd))
}

/** Shortest distance from `point` to a line segment defined by two endpoints. */
export function distancePointToSegment(p: Vector2, a: Vector2, b: Vector2): number {
  const ab = b.sub(a)
  const lengthSq = ab.dot(ab)
  if (lengthSq === 0) return p.distanceTo(a)
  const t = Math.max(0, Math.min(1, p.sub(a).dot(ab) / lengthSq))
  const proj = a.add(ab.scale(t))
  return p.distanceTo(proj)
}

/** Returns the closest point on any segment of a {@link Polyline} to `point`. */
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

/** Shortest distance from `point` to any segment of a {@link Polyline}. */
export function distancePointToPolyline(point: Vector2, polyline: Polyline): number {
  return point.distanceTo(closestPointOnPolyline(point, polyline))
}

/** Shortest distance from `point` to the circumference of a {@link Circle}. */
export function distancePointToCircle(point: Vector2, circle: Circle): number {
  return Math.abs(point.distanceTo(circle.center) - circle.radius)
}

/** Shortest distance from `point` to the edge of a {@link Polyline}. */
export function distancePointToPolylineEdge(point: Vector2, polyline: Polyline): number {
  let minDist = Infinity
  const count = polyline.segmentCount()
  for (let i = 0; i < count; i++) {
    const [a, b] = polyline.segmentAt(i)
    const d = distancePointToSegment(point, a, b)
    if (d < minDist) minDist = d
  }
  return minDist
}

/** Shortest distance from `point` to the edge of a {@link Rectangle}. */
export function distancePointToRectEdge(point: Vector2, rect: Rectangle): number {
  const { x, y } = rect.origin
  const corners = [
    new Vector2(x, y),
    new Vector2(x + rect.width, y),
    new Vector2(x + rect.width, y + rect.height),
    new Vector2(x, y + rect.height),
  ]
  let minDist = Infinity
  for (let i = 0; i < 4; i++) {
    const d = distancePointToSegment(point, corners[i], corners[(i + 1) % 4])
    if (d < minDist) minDist = d
  }
  return minDist
}

/** Shortest distance from `point` to the edge of a {@link Path} (linearized). */
export function distancePointToPathEdge(point: Vector2, path: Path, steps = 8): number {
  const pts = path.toPolylinePoints(steps)
  let minDist = Infinity
  for (let i = 0; i < pts.length - 1; i++) {
    const d = distancePointToSegment(point, pts[i], pts[i + 1])
    if (d < minDist) minDist = d
  }
  return minDist
}
