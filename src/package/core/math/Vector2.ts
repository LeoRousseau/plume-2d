/**
 * A 2D vector with x, y components.
 *
 * @example
 * ```ts
 * const a = new Vector2(3, 4)
 * a.length()           // 5
 * a.normalize()        // Vector2(0.6, 0.8)
 * a.add(new Vector2(1, 0)) // Vector2(4, 4)
 * ```
 */
export class Vector2 {
  constructor(
    public x: number = 0,
    public y: number = 0,
  ) {}

  /** Returns a new vector: `this + v`. */
  add(v: Vector2): Vector2 {
    return new Vector2(this.x + v.x, this.y + v.y)
  }

  /** Returns a new vector: `this - v`. */
  sub(v: Vector2): Vector2 {
    return new Vector2(this.x - v.x, this.y - v.y)
  }

  /** Returns a new vector scaled by `s`. */
  scale(s: number): Vector2 {
    return new Vector2(this.x * s, this.y * s)
  }

  /** Euclidean length of this vector. */
  length(): number {
    return Math.sqrt(this.x * this.x + this.y * this.y)
  }

  /** Returns a unit-length vector in the same direction, or zero vector if length is 0. */
  normalize(): Vector2 {
    const len = this.length()
    if (len === 0) return new Vector2()
    return this.scale(1 / len)
  }

  /** Dot product: `this · v`. */
  dot(v: Vector2): number {
    return this.x * v.x + this.y * v.y
  }

  /** Euclidean distance from this vector to `v`. */
  distanceTo(v: Vector2): number {
    return this.sub(v).length()
  }

  /** Mutates this vector in place. Returns `this` for chaining. */
  set(x: number, y: number): this {
    this.x = x
    this.y = y
    return this
  }

  /** Mutates: `this += v`. */
  addSelf(v: Vector2): this {
    this.x += v.x
    this.y += v.y
    return this
  }

  /** Mutates: `this -= v`. */
  subSelf(v: Vector2): this {
    this.x -= v.x
    this.y -= v.y
    return this
  }

  /** Mutates: `this *= s`. */
  scaleSelf(s: number): this {
    this.x *= s
    this.y *= s
    return this
  }

  /** Returns a new vector transformed by a 2D affine matrix. */
  transformBy(m: { a: number; b: number; c: number; d: number; tx: number; ty: number }): Vector2 {
    return new Vector2(
      m.a * this.x + m.c * this.y + m.tx,
      m.b * this.x + m.d * this.y + m.ty,
    )
  }

  /** Returns a deep copy. */
  clone(): Vector2 {
    return new Vector2(this.x, this.y)
  }

  /** Strict equality check. */
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

  /** 2D cross product (z-component of the 3D cross product). */
  static cross(a: Vector2, b: Vector2): number {
    return a.x * b.y - a.y * b.x
  }
}
