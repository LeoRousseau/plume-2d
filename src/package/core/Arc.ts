import { Vector2 } from '../math/Vector2'
import { BoundingBox } from '../math/BoundingBox'
import type { IRenderer } from '../rendering/IRenderer'
import { Shape } from './Shape'

export class Arc extends Shape {
  center: Vector2
  radius: number
  startAngle: number
  endAngle: number

  constructor(
    center: Vector2 = new Vector2(),
    radius: number = 1,
    startAngle: number = 0,
    endAngle: number = Math.PI,
  ) {
    super()
    this.center = center
    this.radius = radius
    this.startAngle = startAngle
    this.endAngle = endAngle
  }

  draw(renderer: IRenderer): void {
    renderer.drawArc(this)
  }

  getBoundingBox(): BoundingBox {
    const points = [this.startPoint(), this.endPoint()]
    // Check if arc crosses 0, π/2, π, 3π/2
    const angles = [0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2]
    for (const a of angles) {
      if (this.containsAngle(a)) {
        points.push(new Vector2(
          this.center.x + this.radius * Math.cos(a),
          this.center.y + this.radius * Math.sin(a),
        ))
      }
    }
    return BoundingBox.fromPoints(points)
  }

  arcLength(): number {
    let sweep = this.endAngle - this.startAngle
    if (sweep < 0) sweep += Math.PI * 2
    return this.radius * sweep
  }

  startPoint(): Vector2 {
    return new Vector2(
      this.center.x + this.radius * Math.cos(this.startAngle),
      this.center.y + this.radius * Math.sin(this.startAngle),
    )
  }

  endPoint(): Vector2 {
    return new Vector2(
      this.center.x + this.radius * Math.cos(this.endAngle),
      this.center.y + this.radius * Math.sin(this.endAngle),
    )
  }

  private containsAngle(angle: number): boolean {
    let start = ((this.startAngle % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2)
    let end = ((this.endAngle % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2)
    const a = ((angle % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2)
    if (start <= end) {
      return a >= start && a <= end
    }
    return a >= start || a <= end
  }
}
