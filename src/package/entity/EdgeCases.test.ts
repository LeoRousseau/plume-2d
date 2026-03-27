import { describe, it, expect } from 'vitest'
import { Circle } from '../entity/Circle'
import { Rectangle } from '../entity/Rectangle'
import { Polyline } from '../entity/Polyline'
import { Arc } from '../entity/Arc'
import { Path } from '../entity/Path'
import { Text } from '../entity/Text'
import { Vector2 } from '../math/Vector2'

describe('Circle edge cases', () => {
  it('zero radius: area=0, perimeter=0', () => {
    const c = new Circle(new Vector2(), 0)
    expect(c.area()).toBe(0)
    expect(c.perimeter()).toBe(0)
  })

  it('zero radius: containsPoint at center returns true', () => {
    const c = new Circle(new Vector2(), 0)
    expect(c.containsPoint(new Vector2(0, 0))).toBe(true)
  })

  it('zero radius: distanceToEdge equals distance to center', () => {
    const c = new Circle(new Vector2(), 0)
    const p = new Vector2(3, 4)
    expect(c.distanceToEdge(p)).toBeCloseTo(p.distanceTo(c.center))
  })
})

describe('Rectangle edge cases', () => {
  it('zero dimensions: area=0, perimeter=0', () => {
    const r = new Rectangle(new Vector2(), 0, 0)
    expect(r.area()).toBe(0)
    expect(r.perimeter()).toBe(0)
  })
})

describe('Polyline edge cases', () => {
  it('empty polyline: perimeter=0, area=0, segmentCount=0', () => {
    const p = new Polyline()
    expect(p.perimeter()).toBe(0)
    expect(p.area()).toBe(0)
    expect(p.segmentCount()).toBe(0)
  })

  it('single point polyline: perimeter=0', () => {
    const p = new Polyline([new Vector2(1, 2)])
    expect(p.perimeter()).toBe(0)
  })

  it('containsPoint on open polyline always returns false', () => {
    const p = new Polyline([
      new Vector2(0, 0),
      new Vector2(10, 0),
      new Vector2(10, 10),
      new Vector2(0, 10),
    ], false)
    expect(p.containsPoint(new Vector2(5, 5))).toBe(false)
  })
})

describe('Arc edge cases', () => {
  it('zero-length arc (startAngle === endAngle): perimeter=0, area=0', () => {
    const a = new Arc(new Vector2(), 5, 0, 0)
    expect(a.perimeter()).toBe(0)
    expect(a.area()).toBe(0)
  })
})

describe('Path edge cases', () => {
  it('empty path: perimeter=0, area=0', () => {
    const p = new Path()
    expect(p.perimeter()).toBe(0)
    expect(p.area()).toBe(0)
  })
})

describe('Text edge cases', () => {
  it('empty content: getBoundingBox has width=0', () => {
    const t = new Text('', new Vector2())
    const bb = t.getBoundingBox()
    expect(bb.width).toBe(0)
  })
})
