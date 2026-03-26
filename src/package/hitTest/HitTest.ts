import { Vector2 } from '../math/Vector2'
import type { Node } from '../core/Node'
import type { Scene } from '../core/Scene'
import { AShape } from '../entity/Shape'
import { Polyline } from '../entity/Polyline'
import { Circle } from '../entity/Circle'
import { Rectangle } from '../entity/Rectangle'
import { Ellipse } from '../entity/Ellipse'
import { Arc } from '../entity/Arc'
import { Path } from '../entity/Path'
import { Text } from '../entity/Text'
import { distancePointToPolylineEdge, distancePointToRectEdge, distancePointToPathEdge } from '../geometry/distance'

/** Result returned by {@link hitTest} when a shape is hit. */
export interface HitTestResult {
  /** The shape that was hit. */
  shape: AShape
  /** The test point in the shape's local coordinate space. */
  point: Vector2
}

/**
 * Hit-tests a scene at the given world-space point.
 * Shorthand for `hitTest(scene.root, worldPoint, tolerance)`.
 */
export function pick(scene: Scene, worldPoint: Vector2, tolerance: number = 2): HitTestResult | null {
  return hitTest(scene.root, worldPoint, tolerance)
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

  if (!(node instanceof AShape)) return null

  const inv = node.transform.worldMatrix.invert()
  if (!inv) return null
  const localPoint = inv.transformPoint(worldPoint)

  if (testShape(node, localPoint, tolerance)) {
    return { shape: node, point: localPoint }
  }

  return null
}

function testShape(shape: AShape, p: Vector2, tolerance: number): boolean {
  const bb = shape.getBoundingBox().pad(tolerance)
  if (!bb.containsPoint(p)) return false

  if (shape instanceof Polyline) {
    if (shape.isClosed && shape.fill.color !== 'transparent') {
      return shape.containsPoint(p)
    }
    return distancePointToPolylineEdge(p, shape) <= tolerance
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
    return distancePointToRectEdge(p, shape) <= tolerance
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
    return distancePointToPathEdge(p, shape) <= tolerance
  }

  if (shape instanceof Text) {
    return shape.getBoundingBox().containsPoint(p)
  }

  return false
}
