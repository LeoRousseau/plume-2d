import { Vector2 } from '../math/Vector2'
import type { AShape } from '../entity/Shape'
import { Polyline } from '../entity/Polyline'
import { Circle } from '../entity/Circle'
import { Rectangle } from '../entity/Rectangle'
import { Ellipse } from '../entity/Ellipse'
import { closestPointOnPolyline } from '../geometry/distance'

/** The kind of geometry feature the snap locked onto. */
export type SnapType = 'grid' | 'point' | 'edge' | 'center' | 'intersection'

/** Result returned by {@link snap} when a candidate is found within tolerance. */
export interface SnapResult {
  /** The snapped-to point. */
  point: Vector2
  /** Which feature type was snapped to. */
  type: SnapType
  /** Distance from the original point to the snapped point. */
  distance: number
}

/** Options controlling which snap targets are active. */
export interface SnapOptions {
  /** Grid spacing in scene units (default 10). */
  gridSize?: number
  snapToGrid?: boolean
  snapToPoints?: boolean
  snapToEdges?: boolean
  snapToCenters?: boolean
  /** Maximum snap distance in scene units (default 15). */
  tolerance?: number
}

const defaultOptions: Required<SnapOptions> = {
  gridSize: 10,
  snapToGrid: true,
  snapToPoints: true,
  snapToEdges: true,
  snapToCenters: true,
  tolerance: 15,
}

/**
 * Finds the nearest snap target for a given point.
 *
 * @param point   - The point to snap (e.g. cursor position in scene coords).
 * @param shapes  - Shapes to consider for point/edge/center snapping.
 * @param options - Snap configuration.
 * @returns The closest snap candidate within tolerance, or `null`.
 *
 * @example
 * ```ts
 * const result = snap(new Vector2(12, 18), shapes, { gridSize: 10, tolerance: 15 })
 * if (result) {
 *   console.log(result.type, result.point) // 'grid', Vector2(10, 20)
 * }
 * ```
 */
export function snap(point: Vector2, shapes: AShape[], options: SnapOptions = {}): SnapResult | null {
  const opts = { ...defaultOptions, ...options }
  const candidates: SnapResult[] = []

  if (opts.snapToGrid) {
    const gx = Math.round(point.x / opts.gridSize) * opts.gridSize
    const gy = Math.round(point.y / opts.gridSize) * opts.gridSize
    const gridPoint = new Vector2(gx, gy)
    candidates.push({ point: gridPoint, type: 'grid', distance: point.distanceTo(gridPoint) })
  }

  for (const shape of shapes) {
    if (opts.snapToPoints) {
      for (const p of getShapePoints(shape)) {
        candidates.push({ point: p, type: 'point', distance: point.distanceTo(p) })
      }
    }

    if (opts.snapToCenters) {
      const center = getShapeCenter(shape)
      if (center) {
        candidates.push({ point: center, type: 'center', distance: point.distanceTo(center) })
      }
    }

    if (opts.snapToEdges && shape instanceof Polyline) {
      const cp = closestPointOnPolyline(point, shape)
      candidates.push({ point: cp, type: 'edge', distance: point.distanceTo(cp) })
    }
  }

  const valid = candidates.filter((c) => c.distance <= opts.tolerance)
  if (valid.length === 0) return null
  valid.sort((a, b) => a.distance - b.distance)
  return valid[0]
}

function getShapePoints(shape: AShape): Vector2[] {
  if (shape instanceof Polyline) return shape.points
  return []
}

function getShapeCenter(shape: AShape): Vector2 | null {
  if (shape instanceof Polyline) return shape.centroid()
  if (shape instanceof Circle) return shape.center.clone()
  if (shape instanceof Rectangle) return shape.getBoundingBox().center()
  if (shape instanceof Ellipse) return shape.center.clone()
  return null
}
