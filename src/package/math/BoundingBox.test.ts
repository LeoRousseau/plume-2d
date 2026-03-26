import { describe, it, expect } from 'vitest'
import { BoundingBox } from './BoundingBox'
import { Vector2 } from './Vector2'

describe('BoundingBox', () => {
  it('computes width and height', () => {
    const bb = new BoundingBox(new Vector2(1, 2), new Vector2(5, 8))
    expect(bb.width).toBe(4)
    expect(bb.height).toBe(6)
  })

  it('computes center', () => {
    const bb = new BoundingBox(new Vector2(0, 0), new Vector2(10, 20))
    const c = bb.center()
    expect(c.x).toBe(5)
    expect(c.y).toBe(10)
  })

  it('containsPoint', () => {
    const bb = new BoundingBox(new Vector2(0, 0), new Vector2(10, 10))
    expect(bb.containsPoint(new Vector2(5, 5))).toBe(true)
    expect(bb.containsPoint(new Vector2(0, 0))).toBe(true)
    expect(bb.containsPoint(new Vector2(11, 5))).toBe(false)
    expect(bb.containsPoint(new Vector2(-1, 5))).toBe(false)
  })

  it('intersects', () => {
    const a = new BoundingBox(new Vector2(0, 0), new Vector2(10, 10))
    const b = new BoundingBox(new Vector2(5, 5), new Vector2(15, 15))
    const c = new BoundingBox(new Vector2(20, 20), new Vector2(30, 30))
    expect(a.intersects(b)).toBe(true)
    expect(b.intersects(a)).toBe(true)
    expect(a.intersects(c)).toBe(false)
  })

  it('union', () => {
    const a = new BoundingBox(new Vector2(0, 0), new Vector2(5, 5))
    const b = new BoundingBox(new Vector2(3, 3), new Vector2(10, 10))
    const u = a.union(b)
    expect(u.min.x).toBe(0)
    expect(u.min.y).toBe(0)
    expect(u.max.x).toBe(10)
    expect(u.max.y).toBe(10)
  })

  it('expand', () => {
    const bb = new BoundingBox(new Vector2(0, 0), new Vector2(5, 5))
    const expanded = bb.expand(new Vector2(-2, 7))
    expect(expanded.min.x).toBe(-2)
    expect(expanded.min.y).toBe(0)
    expect(expanded.max.x).toBe(5)
    expect(expanded.max.y).toBe(7)
  })

  it('pad', () => {
    const bb = new BoundingBox(new Vector2(2, 3), new Vector2(8, 9))
    const padded = bb.pad(1)
    expect(padded.min.x).toBe(1)
    expect(padded.min.y).toBe(2)
    expect(padded.max.x).toBe(9)
    expect(padded.max.y).toBe(10)
  })

  it('empty returns inverted bounds', () => {
    const e = BoundingBox.empty()
    expect(e.min.x).toBe(Infinity)
    expect(e.max.x).toBe(-Infinity)
  })

  it('fromPoints', () => {
    const bb = BoundingBox.fromPoints([
      new Vector2(3, 1),
      new Vector2(-2, 7),
      new Vector2(5, 4),
    ])
    expect(bb.min.x).toBe(-2)
    expect(bb.min.y).toBe(1)
    expect(bb.max.x).toBe(5)
    expect(bb.max.y).toBe(7)
  })

  it('fromPoints with empty array returns empty', () => {
    const bb = BoundingBox.fromPoints([])
    expect(bb.min.x).toBe(Infinity)
  })
})
