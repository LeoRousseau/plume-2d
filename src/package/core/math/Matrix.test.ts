import { describe, it, expect } from 'vitest'
import { Matrix } from './Matrix'
import { Vector2 } from './Vector2'

describe('Matrix', () => {
  it('creates an identity matrix by default', () => {
    const m = new Matrix()
    expect(m.a).toBe(1)
    expect(m.b).toBe(0)
    expect(m.c).toBe(0)
    expect(m.d).toBe(1)
    expect(m.tx).toBe(0)
    expect(m.ty).toBe(0)
  })

  it('identity() returns identity', () => {
    const m = Matrix.identity()
    expect(m.toArray()).toEqual([1, 0, 0, 1, 0, 0])
  })

  it('translation() sets tx/ty', () => {
    const m = Matrix.translation(10, 20)
    expect(m.tx).toBe(10)
    expect(m.ty).toBe(20)
    expect(m.a).toBe(1)
    expect(m.d).toBe(1)
  })

  it('rotation() creates a rotation matrix', () => {
    const m = Matrix.rotation(Math.PI / 2)
    expect(m.a).toBeCloseTo(0)
    expect(m.b).toBeCloseTo(1)
    expect(m.c).toBeCloseTo(-1)
    expect(m.d).toBeCloseTo(0)
  })

  it('scaling() creates a scale matrix', () => {
    const m = Matrix.scaling(2, 3)
    expect(m.a).toBe(2)
    expect(m.d).toBe(3)
    expect(m.b).toBe(0)
    expect(m.c).toBe(0)
  })

  it('compose() produces T * R * S', () => {
    const m = Matrix.compose(new Vector2(10, 20), 0, new Vector2(2, 3))
    expect(m.a).toBeCloseTo(2)
    expect(m.d).toBeCloseTo(3)
    expect(m.tx).toBe(10)
    expect(m.ty).toBe(20)
  })

  it('compose() with rotation', () => {
    const m = Matrix.compose(new Vector2(0, 0), Math.PI / 2, new Vector2(1, 1))
    expect(m.a).toBeCloseTo(0)
    expect(m.b).toBeCloseTo(1)
    expect(m.c).toBeCloseTo(-1)
    expect(m.d).toBeCloseTo(0)
  })

  it('multiply() composes two matrices', () => {
    const t = Matrix.translation(5, 10)
    const s = Matrix.scaling(2, 2)
    const result = t.multiply(s)
    // Translation then scale: point (1,1) -> scale to (2,2) -> translate to (7,12)
    const p = result.transformPoint(new Vector2(1, 1))
    expect(p.x).toBeCloseTo(7)
    expect(p.y).toBeCloseTo(12)
  })

  it('transformPoint() applies the matrix', () => {
    const m = Matrix.translation(10, 20)
    const p = m.transformPoint(new Vector2(1, 2))
    expect(p.x).toBe(11)
    expect(p.y).toBe(22)
  })

  it('transformPoint() with scale', () => {
    const m = Matrix.scaling(3, 4)
    const p = m.transformPoint(new Vector2(2, 5))
    expect(p.x).toBe(6)
    expect(p.y).toBe(20)
  })

  it('invert() produces the inverse matrix', () => {
    const m = Matrix.compose(new Vector2(10, 20), Math.PI / 4, new Vector2(2, 3))
    const inv = m.invert()
    expect(inv).not.toBeNull()
    const result = m.multiply(inv!)
    expect(result.a).toBeCloseTo(1)
    expect(result.b).toBeCloseTo(0)
    expect(result.c).toBeCloseTo(0)
    expect(result.d).toBeCloseTo(1)
    expect(result.tx).toBeCloseTo(0)
    expect(result.ty).toBeCloseTo(0)
  })

  it('invert() returns null for singular matrix', () => {
    const m = new Matrix(0, 0, 0, 0, 5, 5)
    expect(m.invert()).toBeNull()
  })

  it('determinant()', () => {
    const m = new Matrix(2, 0, 0, 3, 0, 0)
    expect(m.determinant()).toBe(6)
    const singular = new Matrix(1, 2, 2, 4, 0, 0)
    expect(singular.determinant()).toBe(0)
  })

  it('decompose() round-trips with compose()', () => {
    const pos = new Vector2(10, 20)
    const rot = Math.PI / 6
    const scl = new Vector2(2, 3)
    const m = Matrix.compose(pos, rot, scl)
    const d = m.decompose()
    expect(d.position.x).toBeCloseTo(10)
    expect(d.position.y).toBeCloseTo(20)
    expect(d.rotation).toBeCloseTo(rot)
    expect(d.scale.x).toBeCloseTo(2)
    expect(d.scale.y).toBeCloseTo(3)
  })

  it('toArray() returns 6 elements', () => {
    const m = new Matrix(1, 2, 3, 4, 5, 6)
    expect(m.toArray()).toEqual([1, 2, 3, 4, 5, 6])
  })

  it('clone() creates a separate copy', () => {
    const m = new Matrix(1, 2, 3, 4, 5, 6)
    const c = m.clone()
    expect(c.toArray()).toEqual(m.toArray())
    c.tx = 99
    expect(m.tx).toBe(5)
  })

  it('identity multiply produces same matrix', () => {
    const m = Matrix.compose(new Vector2(5, 10), Math.PI / 3, new Vector2(2, 2))
    const result = Matrix.identity().multiply(m)
    expect(result.a).toBeCloseTo(m.a)
    expect(result.b).toBeCloseTo(m.b)
    expect(result.c).toBeCloseTo(m.c)
    expect(result.d).toBeCloseTo(m.d)
    expect(result.tx).toBeCloseTo(m.tx)
    expect(result.ty).toBeCloseTo(m.ty)
  })
})
