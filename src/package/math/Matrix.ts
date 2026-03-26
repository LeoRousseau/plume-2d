import { Vector2 } from './Vector2'
import { MATRIX_EPSILON } from './constants'

/**
 * 2D affine transform matrix (3x3) stored as 6 named fields.
 *
 * Layout (matches Canvas2D setTransform):
 *   | a  c  tx |
 *   | b  d  ty |
 *   | 0  0  1  |
 *
 * @example
 * ```ts
 * const m = Matrix.compose(new Vector2(10, 20), Math.PI / 4, new Vector2(1, 1))
 * const p = m.transformPoint(new Vector2(5, 0))
 * ```
 */
export class Matrix {
  constructor(
    public a: number = 1,
    public b: number = 0,
    public c: number = 0,
    public d: number = 1,
    public tx: number = 0,
    public ty: number = 0,
  ) {}

  static identity(): Matrix {
    return new Matrix()
  }

  static translation(x: number, y: number): Matrix {
    return new Matrix(1, 0, 0, 1, x, y)
  }

  static rotation(radians: number): Matrix {
    const cos = Math.cos(radians)
    const sin = Math.sin(radians)
    return new Matrix(cos, sin, -sin, cos, 0, 0)
  }

  static scaling(x: number, y: number): Matrix {
    return new Matrix(x, 0, 0, y, 0, 0)
  }

  static compose(position: Vector2, rotation: number, scale: Vector2): Matrix {
    // T * R * S
    const cos = Math.cos(rotation)
    const sin = Math.sin(rotation)
    return new Matrix(
      cos * scale.x,
      sin * scale.x,
      -sin * scale.y,
      cos * scale.y,
      position.x,
      position.y,
    )
  }

  multiply(other: Matrix): Matrix {
    return new Matrix(
      this.a * other.a + this.c * other.b,
      this.b * other.a + this.d * other.b,
      this.a * other.c + this.c * other.d,
      this.b * other.c + this.d * other.d,
      this.a * other.tx + this.c * other.ty + this.tx,
      this.b * other.tx + this.d * other.ty + this.ty,
    )
  }

  transformPoint(p: Vector2): Vector2 {
    return new Vector2(
      this.a * p.x + this.c * p.y + this.tx,
      this.b * p.x + this.d * p.y + this.ty,
    )
  }

  /** Returns the determinant of this matrix. */
  determinant(): number {
    return this.a * this.d - this.b * this.c
  }

  /**
   * Returns the inverse of this matrix, or `null` if the matrix is singular (non-invertible).
   */
  invert(): Matrix | null {
    const det = this.determinant()
    if (Math.abs(det) < MATRIX_EPSILON) return null
    const invDet = 1 / det
    return new Matrix(
      this.d * invDet,
      -this.b * invDet,
      -this.c * invDet,
      this.a * invDet,
      (this.c * this.ty - this.d * this.tx) * invDet,
      (this.b * this.tx - this.a * this.ty) * invDet,
    )
  }

  decompose(): { position: Vector2; rotation: number; scale: Vector2 } {
    const position = new Vector2(this.tx, this.ty)
    const scaleX = Math.sqrt(this.a * this.a + this.b * this.b)
    const scaleY = Math.sqrt(this.c * this.c + this.d * this.d)
    const rotation = Math.atan2(this.b, this.a)
    return { position, rotation, scale: new Vector2(scaleX, scaleY) }
  }

  toArray(): number[] {
    return [this.a, this.b, this.c, this.d, this.tx, this.ty]
  }

  clone(): Matrix {
    return new Matrix(this.a, this.b, this.c, this.d, this.tx, this.ty)
  }
}
