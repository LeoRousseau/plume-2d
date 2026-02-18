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

  set(x: number, y: number): this {
    this.x = x
    this.y = y
    return this
  }

  addSelf(v: Vector2): this {
    this.x += v.x
    this.y += v.y
    return this
  }

  subSelf(v: Vector2): this {
    this.x -= v.x
    this.y -= v.y
    return this
  }

  scaleSelf(s: number): this {
    this.x *= s
    this.y *= s
    return this
  }

  transformBy(m: { a: number; b: number; c: number; d: number; tx: number; ty: number }): Vector2 {
    return new Vector2(
      m.a * this.x + m.c * this.y + m.tx,
      m.b * this.x + m.d * this.y + m.ty,
    )
  }

  clone(): Vector2 {
    return new Vector2(this.x, this.y)
  }

  equals(v: Vector2): boolean {
    return this.x === v.x && this.y === v.y
  }

  static from(x: number, y: number): Vector2 {
    return new Vector2(x, y)
  }

  static zero(): Vector2 {
    return new Vector2(0, 0)
  }

  static one(): Vector2 {
    return new Vector2(1, 1)
  }

  static cross(a: Vector2, b: Vector2): number {
    return a.x * b.y - a.y * b.x
  }
}
