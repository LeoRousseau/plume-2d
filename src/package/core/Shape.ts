import { Node } from '../core/Node'
import type { IRenderer } from '../rendering/IRenderer'
import type { BoundingBox } from '../math/BoundingBox'
import type { StrokeStyle } from './StrokeStyle'
import type { FillStyle } from './FillStyle'
import { defaultStroke } from './StrokeStyle'
import { defaultFill } from './FillStyle'

/**
 * Abstract base class for all drawable shapes.
 *
 * Shapes extend {@link Node} and add visual properties (stroke, fill)
 * plus the ability to compute their bounding box and draw themselves
 * through a renderer.
 */
export abstract class Shape extends Node {
  /** Stroke styling (color, width, dash pattern, etc.). */
  stroke: StrokeStyle
  /** Fill styling (color, opacity). */
  fill: FillStyle

  constructor() {
    super()
    this.stroke = defaultStroke()
    this.fill = defaultFill()
  }

  /** Returns the axis-aligned bounding box of this shape in local coordinates. */
  abstract getBoundingBox(): BoundingBox
  /** Draws this shape using the given renderer. */
  abstract draw(renderer: IRenderer): void
}
