import { Vector2 } from '../math/Vector2'
import { BoundingBox } from '../math/BoundingBox'
import type { IRenderer } from '../renderer/IRenderer'
import { ARenderable } from './Renderable'

/**
 * A raster image positioned at a point in 2D space.
 *
 * Extends {@link ARenderable} for scene-graph integration and rendering,
 * but is not an {@link AShape} — geometric operations (area, perimeter,
 * distanceToEdge) are not meaningful for raster images.
 *
 * The `source` must be a loaded `HTMLImageElement`. The caller is responsible
 * for ensuring the image is fully loaded before rendering.
 *
 * @example
 * ```ts
 * const img = new Image(myHtmlImage, new Vector2(10, 20), 200, 150)
 * scene.root.addChild(img)
 * ```
 */
export class Raster extends ARenderable {
  /** The loaded image element to draw. */
  source: HTMLImageElement
  /** Top-left position. */
  origin: Vector2
  /** Display width in scene units. */
  width: number
  /** Display height in scene units. */
  height: number

  constructor(
    source: HTMLImageElement,
    origin: Vector2 = new Vector2(),
    width?: number,
    height?: number,
  ) {
    super()
    this.source = source
    this.origin = origin
    this.width = width ?? source.naturalWidth
    this.height = height ?? source.naturalHeight
    this.stroke = { color: '#000000', width: 0 }
    this.fill = null
  }

  draw(renderer: IRenderer): void {
    renderer.drawImage(this)
  }

  getBoundingBox(): BoundingBox {
    return new BoundingBox(
      this.origin.clone(),
      new Vector2(this.origin.x + this.width, this.origin.y + this.height),
    )
  }

  /** Returns `true` if the point lies inside the image bounds. */
  containsPoint(p: Vector2): boolean {
    return this.getBoundingBox().containsPoint(p)
  }
}
