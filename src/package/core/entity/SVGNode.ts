import { Vector2 } from '../math/Vector2'
import { BoundingBox } from '../math/BoundingBox'
import type { IRenderer } from '../renderer/IRenderer'
import { ARenderable } from './Renderable'

/**
 * A self-contained SVG document rendered as a single unit in the scene graph.
 *
 * Unlike {@link parseSVG}, which decomposes SVG into individual entities,
 * `SVGNode` keeps the SVG content opaque — it is rendered as one block
 * (like {@link Raster}) but re-rasterizes at the current zoom level so it
 * stays crisp at any scale.
 *
 * @example
 * ```ts
 * const node = new SVGNode(svgString, new Vector2(10, 20), 200, 150)
 * scene.root.addChild(node)
 * ```
 */
export class SVGNode extends ARenderable {
  /** Raw SVG markup. */
  readonly svg: string
  /** Top-left position. */
  origin: Vector2
  /** Display width in scene units. */
  width: number
  /** Display height in scene units. */
  height: number

  /** @internal Cached rasterized image. */
  _cache: HTMLCanvasElement | null = null
  /** @internal Zoom level at which the cache was generated. */
  _cacheZoom: number = 0
  /** @internal Whether a rasterization is currently in flight. */
  _cachePending: boolean = false

  constructor(
    svg: string,
    origin: Vector2 = new Vector2(),
    width: number = 100,
    height: number = 100,
  ) {
    super()
    this.svg = svg
    this.origin = origin
    this.width = width
    this.height = height
    this.stroke = { color: '#000000', width: 0 }
    this.fill = null
  }

  /** Invalidates the raster cache. Call after modifying width/height. */
  invalidate(): void {
    this._cache = null
    this._cacheZoom = 0
    this._cachePending = false
  }

  draw(renderer: IRenderer): void {
    renderer.drawSVGNode(this)
  }

  getBoundingBox(): BoundingBox {
    return new BoundingBox(
      this.origin.clone(),
      new Vector2(this.origin.x + this.width, this.origin.y + this.height),
    )
  }

  /** Returns `true` if the point lies inside the SVG bounds. */
  containsPoint(p: Vector2): boolean {
    return this.getBoundingBox().containsPoint(p)
  }
}
