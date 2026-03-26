import { Vector2 } from './Vector2'

export class BoundingBox {
  constructor(
    public min: Vector2,
    public max: Vector2,
  ) {}

  get width(): number {
    return this.max.x - this.min.x
  }

  get height(): number {
    return this.max.y - this.min.y
  }

  center(): Vector2 {
    return new Vector2(
      (this.min.x + this.max.x) / 2,
      (this.min.y + this.max.y) / 2,
    )
  }

  containsPoint(p: Vector2): boolean {
    return p.x >= this.min.x && p.x <= this.max.x && p.y >= this.min.y && p.y <= this.max.y
  }

  intersects(other: BoundingBox): boolean {
    return (
      this.min.x <= other.max.x &&
      this.max.x >= other.min.x &&
      this.min.y <= other.max.y &&
      this.max.y >= other.min.y
    )
  }

  union(other: BoundingBox): BoundingBox {
    return new BoundingBox(
      new Vector2(Math.min(this.min.x, other.min.x), Math.min(this.min.y, other.min.y)),
      new Vector2(Math.max(this.max.x, other.max.x), Math.max(this.max.y, other.max.y)),
    )
  }

  expand(point: Vector2): BoundingBox {
    return new BoundingBox(
      new Vector2(Math.min(this.min.x, point.x), Math.min(this.min.y, point.y)),
      new Vector2(Math.max(this.max.x, point.x), Math.max(this.max.y, point.y)),
    )
  }

  pad(amount: number): BoundingBox {
    return new BoundingBox(
      new Vector2(this.min.x - amount, this.min.y - amount),
      new Vector2(this.max.x + amount, this.max.y + amount),
    )
  }

  static empty(): BoundingBox {
    return new BoundingBox(
      new Vector2(Infinity, Infinity),
      new Vector2(-Infinity, -Infinity),
    )
  }

  static fromPoints(points: Vector2[]): BoundingBox {
    if (points.length === 0) return BoundingBox.empty()
    let minX = Infinity,
      minY = Infinity,
      maxX = -Infinity,
      maxY = -Infinity
    for (const p of points) {
      if (p.x < minX) minX = p.x
      if (p.y < minY) minY = p.y
      if (p.x > maxX) maxX = p.x
      if (p.y > maxY) maxY = p.y
    }
    return new BoundingBox(new Vector2(minX, minY), new Vector2(maxX, maxY))
  }
}
