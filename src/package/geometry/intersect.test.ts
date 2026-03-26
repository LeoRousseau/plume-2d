import { describe, it, expect } from 'vitest'
import { Vector2 } from '../math/Vector2'
import { intersectLineLine, intersectLineCircle, intersectCircleCircle, intersectsAABB } from './intersect'
import { BoundingBox } from '../math/BoundingBox'

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

  describe('intersectsAABB', () => {
    it('intersectsAABB detects overlap', () => {
      const a = new BoundingBox(new Vector2(0, 0), new Vector2(10, 10))
      const b = new BoundingBox(new Vector2(5, 5), new Vector2(15, 15))
      expect(intersectsAABB(a, b)).toBe(true)
    })

    it('intersectsAABB detects no overlap', () => {
      const a = new BoundingBox(new Vector2(0, 0), new Vector2(10, 10))
      const b = new BoundingBox(new Vector2(20, 20), new Vector2(30, 30))
      expect(intersectsAABB(a, b)).toBe(false)
    })

    it('intersectsAABB detects touching edges', () => {
      const a = new BoundingBox(new Vector2(0, 0), new Vector2(10, 10))
      const b = new BoundingBox(new Vector2(10, 0), new Vector2(20, 10))
      expect(intersectsAABB(a, b)).toBe(true)
    })
  })

  describe('intersectLineLine – collinear', () => {
    it('intersectLineLine returns null for collinear segments', () => {
      const p = intersectLineLine(
        new Vector2(0, 0), new Vector2(5, 0),
        new Vector2(3, 0), new Vector2(10, 0),
      )
      expect(p).toBeNull()
    })
  })

  describe('intersectLineCircle – tangent', () => {
    it('intersectLineCircle returns tangent point', () => {
      const pts = intersectLineCircle(
        new Vector2(-10, 5), new Vector2(10, 5),
        { center: new Vector2(0, 0), radius: 5 },
      )
      expect(pts).toHaveLength(1)
      expect(pts[0].x).toBeCloseTo(0)
      expect(pts[0].y).toBeCloseTo(5)
    })
  })

  describe('intersectCircleCircle – concentric', () => {
    it('intersectCircleCircle returns empty for concentric', () => {
      const pts = intersectCircleCircle(
        { center: new Vector2(0, 0), radius: 5 },
        { center: new Vector2(0, 0), radius: 10 },
      )
      expect(pts).toHaveLength(0)
    })
  })
})
