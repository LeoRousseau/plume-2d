import { Vector2 } from '../math/Vector2'
import { BoundingBox } from '../math/BoundingBox'
import type { IRenderer } from '../rendering/IRenderer'
import { AShape } from './Shape'

/** Horizontal text alignment. */
export type TextAlign = 'left' | 'center' | 'right'

/** Vertical text baseline. */
export type TextBaseline = 'top' | 'middle' | 'alphabetic' | 'bottom'

/** A text label positioned at a point in 2D space. */
export class Text extends AShape {
  /** The text string to display. */
  content: string
  /** Anchor position. */
  position: Vector2
  /** CSS font-size in pixels. */
  fontSize: number
  /** CSS font-family string. */
  fontFamily: string
  /** Horizontal alignment relative to position. */
  textAlign: TextAlign
  /** Vertical baseline relative to position. */
  textBaseline: TextBaseline

  constructor(
    content: string = '',
    position: Vector2 = new Vector2(),
    fontSize: number = 16,
    fontFamily: string = 'sans-serif',
  ) {
    super()
    this.content = content
    this.position = position
    this.fontSize = fontSize
    this.fontFamily = fontFamily
    this.textAlign = 'left'
    this.textBaseline = 'alphabetic'
    this.stroke = { color: 'transparent', width: 0 }
    this.fill = { color: '#ffffff' }
  }

  /** CSS font shorthand used for Canvas2D rendering. */
  get font(): string {
    return `${this.fontSize}px ${this.fontFamily}`
  }

  draw(renderer: IRenderer): void {
    renderer.drawText(this)
  }

  getBoundingBox(): BoundingBox {
    // Approximate: assumes ~0.6 × fontSize per character width
    const charWidth = this.fontSize * 0.6
    const w = this.content.length * charWidth
    const h = this.fontSize

    let x = this.position.x
    if (this.textAlign === 'center') x -= w / 2
    else if (this.textAlign === 'right') x -= w

    let y = this.position.y
    if (this.textBaseline === 'top') { /* y is already top */ }
    else if (this.textBaseline === 'middle') y -= h / 2
    else if (this.textBaseline === 'bottom') y -= h
    else /* alphabetic */ y -= h * 0.8

    return new BoundingBox(new Vector2(x, y), new Vector2(x + w, y + h))
  }

  /** Returns `true` if the point lies inside the text bounding box. */
  containsPoint(p: Vector2): boolean {
    return this.getBoundingBox().containsPoint(p)
  }

  /** Area of the text bounding box. */
  area(): number {
    const bb = this.getBoundingBox()
    return bb.width * bb.height
  }

  /** Perimeter of the text bounding box. */
  perimeter(): number {
    const bb = this.getBoundingBox()
    return 2 * (bb.width + bb.height)
  }
}
