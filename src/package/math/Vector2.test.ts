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
})
