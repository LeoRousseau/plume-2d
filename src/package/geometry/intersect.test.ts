import { describe, it, expect } from 'vitest'
import { Vector2 } from '../math/Vector2'
import { intersectLineLine, intersectLineCircle, intersectCircleCircle } from './intersect'

describe('intersect', () => {
  describe('intersectLineLine', () => {
    it('finds intersection of two crossing segments', () => {
      const p = intersectLineLine(
        new Vector2(0, 0), new Vector2(10, 10),
        new Vector2(10, 0), new Vector2(0, 10),
      )
      expect(p).not.toBeNull()
      expect(p!.x).toBeCloseTo(5)
      expect(p!.y).toBeCloseTo(5)
    })

    it('returns null for parallel lines', () => {
      const p = intersectLineLine(
        new Vector2(0, 0), new Vector2(10, 0),
        new Vector2(0, 5), new Vector2(10, 5),
      )
      expect(p).toBeNull()
    })

    it('returns null for non-intersecting segments', () => {
      const p = intersectLineLine(
        new Vector2(0, 0), new Vector2(1, 0),
        new Vector2(5, 5), new Vector2(5, 10),
      )
      expect(p).toBeNull()
    })
  })

  describe('intersectLineCircle', () => {
    it('finds two intersection points', () => {
      const pts = intersectLineCircle(
        new Vector2(-10, 0), new Vector2(10, 0),
        { center: new Vector2(0, 0), radius: 5 },
      )
      expect(pts).toHaveLength(2)
      expect(pts[0].x).toBeCloseTo(-5)
      expect(pts[1].x).toBeCloseTo(5)
    })

    it('returns empty for miss', () => {
      const pts = intersectLineCircle(
        new Vector2(-10, 10), new Vector2(10, 10),
        { center: new Vector2(0, 0), radius: 5 },
      )
      expect(pts).toHaveLength(0)
    })
  })

  describe('intersectCircleCircle', () => {
    it('finds two intersection points', () => {
      const pts = intersectCircleCircle(
        { center: new Vector2(0, 0), radius: 5 },
        { center: new Vector2(6, 0), radius: 5 },
      )
      expect(pts).toHaveLength(2)
    })

    it('returns empty for non-overlapping circles', () => {
      const pts = intersectCircleCircle(
        { center: new Vector2(0, 0), radius: 2 },
        { center: new Vector2(10, 0), radius: 2 },
      )
      expect(pts).toHaveLength(0)
    })

    it('returns one point for tangent circles', () => {
      const pts = intersectCircleCircle(
        { center: new Vector2(0, 0), radius: 5 },
        { center: new Vector2(10, 0), radius: 5 },
      )
      expect(pts).toHaveLength(1)
      expect(pts[0].x).toBeCloseTo(5)
    })
  })
})
