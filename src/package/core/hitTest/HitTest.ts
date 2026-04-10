import { Vector2 } from '../math/Vector2'
import { DEFAULT_HIT_TOLERANCE } from '../math/constants'
import type { Node } from '../base/Node'
import type { Scene } from '../base/Scene'
import { ARenderable } from '../entity/Renderable'
import { AShape } from '../entity/Shape'
import { Text } from '../entity/Text'
import { Raster } from '../entity/Raster'
import { SVGNode } from '../entity/SVGNode'

/** Result returned by {@link hitTest} when a shape is hit. */
export interface HitTestResult {
  /** The renderable node that was hit. */
  shape: ARenderable
  /** The test point in the node's local coordinate space. */
  point: Vector2
}

/**
 * Hit-tests a scene at the given world-space point.
 * Shorthand for `hitTest(scene.root, worldPoint, tolerance)`.
 *
 * @example
 * ```ts
 * const result = pick(scene, new Vector2(100, 100))
 * if (result) {
 *   console.log(result.shape, result.point)
 * }
 * ```
 */
export function pick(scene: Scene, worldPoint: Vector2, tolerance: number = DEFAULT_HIT_TOLERANCE): HitTestResult | null {
  return hitTest(scene.root, worldPoint, tolerance)
}

/**
 * Recursively hit-tests a node tree at the given world-space point.
 * Children are tested in reverse order so the top-most (last-added) node wins.
 *
 * @param node       - Root node to start testing from.
 * @param worldPoint - Point in world coordinates.
 * @param tolerance  - Extra pixel tolerance for stroked (non-filled) shapes.
 * @returns The first hit result, or `null` if nothing was hit.
 */
export function hitTest(node: Node, worldPoint: Vector2, tolerance: number = DEFAULT_HIT_TOLERANCE): HitTestResult | null {
  if (!node.visible) return null

  for (let i = node.children.length - 1; i >= 0; i--) {
    const result = hitTest(node.children[i], worldPoint, tolerance)
    if (result) return result
  }

  const inv = node.transform.worldMatrix.invert()
  if (!inv) return null
  const localPoint = inv.transformPoint(worldPoint)

  // Text / Image / SVGNode: bounding box hit test only
  if (node instanceof Text || node instanceof Raster || node instanceof SVGNode) {
    const bb = node.getBoundingBox()
    if (bb.containsPoint(localPoint)) {
      return { shape: node, point: localPoint }
    }
    return null
  }

  if (!(node instanceof AShape)) return null

  const bb = node.getBoundingBox().pad(tolerance)
  if (!bb.containsPoint(localPoint)) return null

  // Filled shape: containsPoint is enough
  if (node.fill && node.containsPoint(localPoint)) {
    return { shape: node, point: localPoint }
  }

  // Stroke-only or edge proximity
  if (node.distanceToEdge(localPoint) <= tolerance) {
    return { shape: node, point: localPoint }
  }

  return null
}
