import { Vector2 } from '../math/Vector2'
import { BoundingBox } from '../math/BoundingBox'
import type { IRenderer } from '../rendering/IRenderer'
import { Shape } from './Shape'
import { Polyline } from './Polyline'

export class Rectangle extends Shape {
  origin: Vector2
  width: number
  height: number

  constructor(origin: Vector2 = new Vector2(), width: number = 1, height: number = 1) {
    super()
    this.origin = origin
    this.width = width
    this.height = height
  }

  draw(renderer: IRenderer): void {
    renderer.drawRectangle(this)
  }

  getBoundingBox(): BoundingBox {
    return new BoundingBox(
      this.origin.clone(),
      new Vector2(this.origin.x + this.width, this.origin.y + this.height),
    )
  }

  area(): number {
    return this.width * this.height
  }

  perimeter(): number {
    return 2 * (this.width + this.height)
  }

  containsPoint(p: Vector2): boolean {
    return (
      p.x >= this.origin.x &&
      p.x <= this.origin.x + this.width &&
      p.y >= this.origin.y &&
      p.y <= this.origin.y + this.height
    )
  }

  toPolyline(): Polyline {
    const { x, y } = this.origin
    return new Polyline(
      [
        new Vector2(x, y),
        new Vector2(x + this.width, y),
        new Vector2(x + this.width, y + this.height),
        new Vector2(x, y + this.height),
      ],
      true,
    )
  }
}
