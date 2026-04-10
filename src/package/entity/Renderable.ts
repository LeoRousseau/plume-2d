import { Node } from '../base/Node'
import type { IRenderer } from '../renderer/IRenderer'
import type { BoundingBox } from '../math/BoundingBox'
import type { StrokeStyle } from './StrokeStyle'
import type { FillStyle } from './FillStyle'
import { defaultStroke } from './StrokeStyle'

/**
 * Abstract base class for all renderable nodes (shapes and text).
 *
 * Provides visual properties ({@link stroke}, {@link fill}) and the ability
 * to draw through a renderer. Concrete subclasses include {@link AShape}
 * (geometric shapes) and {@link Text}.
 */
export abstract class ARenderable extends Node {
  /** Stroke styling (color, width, dash pattern, etc.). */
  stroke: StrokeStyle
  /** Fill styling, or `null` for no fill (stroke only). */
  fill: FillStyle | null

  constructor() {
    super()
    this.stroke = defaultStroke()
    this.fill = null
  }

  /** Draws this node using the given renderer. */
  abstract draw(renderer: IRenderer): void
  /** Returns the axis-aligned bounding box in local coordinates. */
  abstract getBoundingBox(): BoundingBox
}
