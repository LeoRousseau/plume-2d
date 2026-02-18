export class Vector2 {
  constructor(
    public x: number = 0,
    public y: number = 0,
  ) {}

  add(v: Vector2): Vector2 {
    return new Vector2(this.x + v.x, this.y + v.y)
  }

  sub(v: Vector2): Vector2 {
    return new Vector2(this.x - v.x, this.y - v.y)
  }

  scale(s: number): Vector2 {
    return new Vector2(this.x * s, this.y * s)
  }

  length(): number {
    return Math.sqrt(this.x * this.x + this.y * this.y)
  }

  normalize(): Vector2 {
    const len = this.length()
    if (len === 0) return new Vector2()
    return this.scale(1 / len)
  }

  dot(v: Vector2): number {
    return this.x * v.x + this.y * v.y
  }

  distanceTo(v: Vector2): number {
    return this.sub(v).length()
  }

  clone(): Vector2 {
    return new Vector2(this.x, this.y)
  }

  equals(v: Vector2): boolean {
    return this.x === v.x && this.y === v.y
  }
}
