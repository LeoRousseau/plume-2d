import { describe, it, expect } from 'vitest'
import { Vector2 } from '../math/Vector2'
import { Polyline } from '../entity/Polyline'
import { Circle } from '../entity/Circle'
import {
  distancePointToLine,
  distancePointToPolyline,
  distancePointToCircle,
  closestPointOnLine,
  closestPointOnPolyline,
} from './distance'

describe('distance', () => {
  it('closestPointOnLine — perpendicular projection', () => {
    const cp = closestPointOnLine(new Vector2(5, 5), new Vector2(0, 0), new Vector2(10, 0))
    expect(cp.x).toBeCloseTo(5)
    expect(cp.y).toBeCloseTo(0)
  })

  it('closestPointOnLine — clamped to start', () => {
    const cp = closestPointOnLine(new Vector2(-5, 0), new Vector2(0, 0), new Vector2(10, 0))
    expect(cp.x).toBeCloseTo(0)
  })

  it('closestPointOnLine — clamped to end', () => {
    const cp = closestPointOnLine(new Vector2(15, 0), new Vector2(0, 0), new Vector2(10, 0))
    expect(cp.x).toBeCloseTo(10)
  })

  it('distancePointToLine', () => {
    const d = distancePointToLine(new Vector2(5, 3), new Vector2(0, 0), new Vector2(10, 0))
    expect(d).toBeCloseTo(3)
  })

  it('closestPointOnPolyline', () => {
    const poly = new Polyline([new Vector2(0, 0), new Vector2(10, 0), new Vector2(10, 10)])
    const cp = closestPointOnPolyline(new Vector2(5, 5), poly)
    // Should be on one of the two segments
    expect(cp.distanceTo(new Vector2(5, 5))).toBeLessThan(6)
  })

  it('distancePointToPolyline', () => {
    const poly = new Polyline([new Vector2(0, 0), new Vector2(10, 0)])
    expect(distancePointToPolyline(new Vector2(5, 3), poly)).toBeCloseTo(3)
  })

  it('distancePointToCircle — outside', () => {
    const c = new Circle(new Vector2(0, 0), 5)
    expect(distancePointToCircle(new Vector2(8, 0), c)).toBeCloseTo(3)
  })

  it('distancePointToCircle — inside', () => {
    const c = new Circle(new Vector2(0, 0), 5)
    expect(distancePointToCircle(new Vector2(2, 0), c)).toBeCloseTo(3)
  })
})
