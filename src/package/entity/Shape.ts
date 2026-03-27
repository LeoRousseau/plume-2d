import type { Path } from './Path'
import type { Vector2 } from '../math/Vector2'
import { ARenderable } from './Renderable'

/**
 * Abstract base class for all geometric shapes.
 *
 * Extends {@link ARenderable} with geometric operations (area, perimeter,
 * hit testing, distance computation, and path conversion).
 */
export abstract class AShape extends ARenderable {
  /** Returns `true` if the point lies inside (or on) this shape. */
  abstract containsPoint(p: Vector2): boolean
  /** Returns the area of this shape. */
  abstract area(): number
  /** Returns the perimeter (boundary length) of this shape. */
  abstract perimeter(): number
  /** Returns the shortest distance from `p` to the edge of this shape. */
  abstract distanceToEdge(p: Vector2): number
  /** Converts this shape to an equivalent {@link Path}. Copies stroke and fill. */
  abstract toPath(): Path
}
