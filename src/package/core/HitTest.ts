import { Vector2 } from '../math/Vector2'
import type { Node } from './Node'
import { Shape } from './Shape'
import { Polyline } from './Polyline'
import { Circle } from './Circle'
import { Rectangle } from './Rectangle'
import { Ellipse } from './Ellipse'
import { Arc } from './Arc'
import { Path } from './Path'

/** Result returned by {@link hitTest} when a shape is hit. */
export interface HitTestResult {
  /** The shape that was hit. */
  shape: Shape
  /** The test point in the shape's local coordinate space. */
  point: Vector2
}

/**
 * Recursively hit-tests a node tree at the given world-space point.
 * Children are tested in reverse order so the top-most (last-added) shape wins.
 *
 * @param node       - Root node to start testing from.
 * @param worldPoint - Point in world coordinates.
 * @param tolerance  - Extra pixel tolerance for stroked (non-filled) shapes.
 * @returns The first hit result, or `null` if nothing was hit.
 */
export function hitTest(node: Node, worldPoint: Vector2, tolerance: number = 2): HitTestResult | null {
  for (let i = node.children.length - 1; i >= 0; i--) {
    const result = hitTest(node.children[i], worldPoint, tolerance)
    if (result) return result
  }

  if (!(node instanceof Shape)) return null

  const localPoint = node.transform.worldMatrix.invert().transformPoint(worldPoint)

  if (testShape(node, localPoint, tolerance)) {
    return { shape: node, point: localPoint }
  }

  return null
}

function testShape(shape: Shape, p: Vector2, tolerance: number): boolean {
  const bb = shape.getBoundingBox().pad(tolerance)
  if (!bb.containsPoint(p)) return false

  if (shape instanceof Polyline) {
    if (shape.isClosed && shape.fill.color !== 'transparent') {
      return shape.containsPoint(p)
    }
    return distanceToPolylineEdge(shape, p) <= tolerance
  }

  if (shape instanceof Circle) {
    if (shape.fill.color !== 'transparent') {
      return shape.containsPoint(p)
    }
    return Math.abs(p.distanceTo(shape.center) - shape.radius) <= tolerance
  }

  if (shape instanceof Rectangle) {
    if (shape.fill.color !== 'transparent') {
      return shape.containsPoint(p)
    }
    return distanceToRectEdge(shape, p) <= tolerance
  }

  if (shape instanceof Ellipse) {
    if (shape.fill.color !== 'transparent') {
      return shape.containsPoint(p)
    }
    const dx = p.x - shape.center.x
    const dy = p.y - shape.center.y
    const val = (dx * dx) / (shape.rx * shape.rx) + (dy * dy) / (shape.ry * shape.ry)
    return Math.abs(val - 1) <= tolerance / Math.min(shape.rx, shape.ry)
  }

  if (shape instanceof Arc) {
    return shape.containsPoint(p, tolerance)
  }

  if (shape instanceof Path) {
    if (shape.fill.color !== 'transparent' && shape.containsPoint(p)) {
      return true
    }
    return distanceToPathEdge(shape, p) <= tolerance
  }

  return false
}

function distanceToPolylineEdge(polyline: Polyline, p: Vector2): number {
  let minDist = Infinity
  const count = polyline.segmentCount()
  for (let i = 0; i < count; i++) {
    const [a, b] = polyline.segmentAt(i)
    const d = distancePointToSegment(p, a, b)
    if (d < minDist) minDist = d
  }
  return minDist
}

function distanceToRectEdge(rect: Rectangle, p: Vector2): number {
  const { x, y } = rect.origin
  const corners = [
    new Vector2(x, y),
    new Vector2(x + rect.width, y),
    new Vector2(x + rect.width, y + rect.height),
    new Vector2(x, y + rect.height),
  ]
  let minDist = Infinity
  for (let i = 0; i < 4; i++) {
    const d = distancePointToSegment(p, corners[i], corners[(i + 1) % 4])
    if (d < minDist) minDist = d
  }
  return minDist
}

function distanceToPathEdge(path: Path, p: Vector2): number {
  const pts = path.toPolylinePoints(8)
  let minDist = Infinity
  for (let i = 0; i < pts.length - 1; i++) {
    const d = distancePointToSegment(p, pts[i], pts[i + 1])
    if (d < minDist) minDist = d
  }
  return minDist
}

function distancePointToSegment(p: Vector2, a: Vector2, b: Vector2): number {
  const ab = b.sub(a)
  const lengthSq = ab.dot(ab)
  if (lengthSq === 0) return p.distanceTo(a)
  const t = Math.max(0, Math.min(1, p.sub(a).dot(ab) / lengthSq))
  const proj = a.add(ab.scale(t))
  return p.distanceTo(proj)
}
