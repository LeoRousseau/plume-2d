import { describe, it, expect } from 'vitest'
import { Vector2 } from './Vector2'

describe('Vector2', () => {
  it('creates a vector with default values', () => {
    const v = new Vector2()
    expect(v.x).toBe(0)
    expect(v.y).toBe(0)
  })

  it('adds two vectors', () => {
    const a = new Vector2(1, 2)
    const b = new Vector2(3, 4)
    const result = a.add(b)
    expect(result.x).toBe(4)
    expect(result.y).toBe(6)
  })

  it('subtracts two vectors', () => {
    const a = new Vector2(5, 7)
    const b = new Vector2(2, 3)
    const result = a.sub(b)
    expect(result.x).toBe(3)
    expect(result.y).toBe(4)
  })

  it('scales a vector', () => {
    const v = new Vector2(3, 4)
    const result = v.scale(2)
    expect(result.x).toBe(6)
    expect(result.y).toBe(8)
  })

  it('computes length', () => {
    const v = new Vector2(3, 4)
    expect(v.length()).toBe(5)
  })

  it('normalizes a vector', () => {
    const v = new Vector2(0, 5)
    const n = v.normalize()
    expect(n.x).toBeCloseTo(0)
    expect(n.y).toBeCloseTo(1)
  })

  it('normalizes a zero vector safely', () => {
    const v = new Vector2(0, 0)
    const n = v.normalize()
    expect(n.x).toBe(0)
    expect(n.y).toBe(0)
  })

  it('computes dot product', () => {
    const a = new Vector2(1, 0)
    const b = new Vector2(0, 1)
    expect(a.dot(b)).toBe(0)
  })

  it('computes distance between two vectors', () => {
    const a = new Vector2(0, 0)
    const b = new Vector2(3, 4)
    expect(a.distanceTo(b)).toBe(5)
  })

  it('clones a vector', () => {
    const v = new Vector2(1, 2)
    const c = v.clone()
    expect(c.equals(v)).toBe(true)
    expect(c).not.toBe(v)
  })

  it('set() mutates in place and returns this', () => {
    const v = new Vector2(1, 2)
    const ret = v.set(10, 20)
    expect(ret).toBe(v)
    expect(v.x).toBe(10)
    expect(v.y).toBe(20)
  })

  it('addSelf() mutates in place', () => {
    const v = new Vector2(1, 2)
    v.addSelf(new Vector2(3, 4))
    expect(v.x).toBe(4)
    expect(v.y).toBe(6)
  })

  it('subSelf() mutates in place', () => {
    const v = new Vector2(5, 7)
    v.subSelf(new Vector2(2, 3))
    expect(v.x).toBe(3)
    expect(v.y).toBe(4)
  })

  it('scaleSelf() mutates in place', () => {
    const v = new Vector2(3, 4)
    v.scaleSelf(2)
    expect(v.x).toBe(6)
    expect(v.y).toBe(8)
  })

  it('transformBy() applies an affine matrix', () => {
    const v = new Vector2(1, 0)
    // 90° rotation matrix
    const m = { a: 0, b: 1, c: -1, d: 0, tx: 10, ty: 20 }
    const result = v.transformBy(m)
    expect(result.x).toBeCloseTo(10)
    expect(result.y).toBeCloseTo(21)
  })

  it('Vector2.from() creates a vector', () => {
    const v = Vector2.from(3, 4)
    expect(v.x).toBe(3)
    expect(v.y).toBe(4)
  })

  it('Vector2.zero() returns (0, 0)', () => {
    const v = Vector2.zero()
    expect(v.x).toBe(0)
    expect(v.y).toBe(0)
  })

  it('Vector2.one() returns (1, 1)', () => {
    const v = Vector2.one()
    expect(v.x).toBe(1)
    expect(v.y).toBe(1)
  })

  it('Vector2.cross() computes 2D cross product', () => {
    const a = new Vector2(1, 0)
    const b = new Vector2(0, 1)
    expect(Vector2.cross(a, b)).toBe(1)
    expect(Vector2.cross(b, a)).toBe(-1)
  })
})
