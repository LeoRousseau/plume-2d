import { Node } from '../core/Node'
import type { IRenderer } from '../renderer/IRenderer'
import type { BoundingBox } from '../math/BoundingBox'
import type { Vector2 } from '../math/Vector2'
import type { StrokeStyle } from './StrokeStyle'
import type { FillStyle } from './FillStyle'
import { defaultStroke } from './StrokeStyle'

/**
 * Abstract base class for all drawable shapes.
 *
 * Shapes extend {@link Node} and add visual properties (stroke, fill)
 * plus the ability to compute their bounding box and draw themselves
 * through a renderer.
 */
export abstract class AShape extends Node {
  /** Stroke styling (color, width, dash pattern, etc.). */
  stroke: StrokeStyle
  /** Fill styling, or `null` for no fill (stroke only). */
  fill: FillStyle | null

  constructor() {
    super()
    this.stroke = defaultStroke()
    this.fill = null
  }

  /** Returns the axis-aligned bounding box of this shape in local coordinates. */
  abstract getBoundingBox(): BoundingBox
  /** Draws this shape using the given renderer. */
  abstract draw(renderer: IRenderer): void
  /** Returns `true` if the point lies inside (or on) this shape. */
  abstract containsPoint(p: Vector2): boolean
  /** Returns the area of this shape. */
  abstract area(): number
  /** Returns the perimeter (boundary length) of this shape. */
  abstract perimeter(): number
  /** Returns the shortest distance from `p` to the edge of this shape. */
  abstract distanceToEdge(p: Vector2): number
}
