import { describe, it, expect, vi } from 'vitest'
import { Polyline } from './Polyline'
import { Vector2 } from '../math/Vector2'
import type { IRenderer } from '../renderer/IRenderer'

const mockRenderer: IRenderer = {
  render: vi.fn(),
  drawPolyline: vi.fn(),
  drawCircle: vi.fn(),
  drawRectangle: vi.fn(),
  drawEllipse: vi.fn(),
  drawArc: vi.fn(),
  drawPath: vi.fn(),
  drawText: vi.fn(),
  drawImage: vi.fn(),
  drawSVGNode: vi.fn(),
}

describe('Polyline', () => {
  it('creates an empty polyline', () => {
    const p = new Polyline()
    expect(p.points).toEqual([])
    expect(p.isClosed).toBe(false)
  })

  it('creates a polyline with points', () => {
    const pts = [new Vector2(0, 0), new Vector2(10, 0), new Vector2(10, 10)]
    const p = new Polyline(pts, true)
    expect(p.points).toHaveLength(3)
    expect(p.isClosed).toBe(true)
  })

  it('has default style properties', () => {
    const p = new Polyline()
    expect(p.fill).toBeNull()
    expect(p.stroke.color).toBe('#ffffff')
    expect(p.stroke.width).toBe(1)
  })

  it('calls renderer.drawPolyline on draw', () => {
    const p = new Polyline([new Vector2(0, 0), new Vector2(1, 1)])
    p.draw(mockRenderer)
    expect(mockRenderer.drawPolyline).toHaveBeenCalledWith(p)
  })

  it('inherits Node id and transform', () => {
    const a = new Polyline()
    const b = new Polyline()
    expect(b.id).toBeGreaterThan(a.id)
    expect(a.transform.position.x).toBe(0)
    expect(a.transform.rotation).toBe(0)
  })

  it('supports parent-child relationships', () => {
    const parent = new Polyline()
    const child = new Polyline()
    parent.addChild(child)
    expect(parent.children).toContain(child)
    expect(child.parent).toBe(parent)
  })

  it('computes perimeter for open polyline', () => {
    const p = new Polyline([new Vector2(0, 0), new Vector2(3, 0), new Vector2(3, 4)])
    expect(p.perimeter()).toBe(7)
  })

  it('computes perimeter for closed polyline', () => {
    const p = new Polyline([new Vector2(0, 0), new Vector2(3, 0), new Vector2(3, 4)], true)
    expect(p.perimeter()).toBe(12)
  })

  it('segmentCount', () => {
    const open = new Polyline([new Vector2(0, 0), new Vector2(1, 0), new Vector2(2, 0)])
    expect(open.segmentCount()).toBe(2)
    const closed = new Polyline([new Vector2(0, 0), new Vector2(1, 0), new Vector2(2, 0)], true)
    expect(closed.segmentCount()).toBe(3)
  })

  it('segmentAt', () => {
    const p = new Polyline([new Vector2(0, 0), new Vector2(10, 0), new Vector2(10, 10)])
    const [a, b] = p.segmentAt(1)
    expect(a.x).toBe(10)
    expect(b.y).toBe(10)
  })

  it('pointAtDistance', () => {
    const p = new Polyline([new Vector2(0, 0), new Vector2(10, 0), new Vector2(10, 10)])
    const pt = p.pointAtDistance(5)
    expect(pt.x).toBeCloseTo(5)
    expect(pt.y).toBeCloseTo(0)
    const pt2 = p.pointAtDistance(15)
    expect(pt2.x).toBeCloseTo(10)
    expect(pt2.y).toBeCloseTo(5)
  })

  it('area (shoelace)', () => {
    // Unit square
    const sq = new Polyline([
      new Vector2(0, 0), new Vector2(1, 0),
      new Vector2(1, 1), new Vector2(0, 1),
    ], true)
    expect(sq.area()).toBeCloseTo(1)
  })

  it('area returns 0 for open polyline', () => {
    const p = new Polyline([new Vector2(0, 0), new Vector2(1, 0), new Vector2(1, 1)])
    expect(p.area()).toBe(0)
  })

  it('centroid', () => {
    const sq = new Polyline([
      new Vector2(0, 0), new Vector2(2, 0),
      new Vector2(2, 2), new Vector2(0, 2),
    ], true)
    const c = sq.centroid()
    expect(c.x).toBeCloseTo(1)
    expect(c.y).toBeCloseTo(1)
  })

  it('getBoundingBox', () => {
    const p = new Polyline([new Vector2(-1, 2), new Vector2(3, -4), new Vector2(5, 6)])
    const bb = p.getBoundingBox()
    expect(bb.min.x).toBe(-1)
    expect(bb.min.y).toBe(-4)
    expect(bb.max.x).toBe(5)
    expect(bb.max.y).toBe(6)
  })

  it('containsPoint (ray-casting)', () => {
    const sq = new Polyline([
      new Vector2(0, 0), new Vector2(10, 0),
      new Vector2(10, 10), new Vector2(0, 10),
    ], true)
    expect(sq.containsPoint(new Vector2(5, 5))).toBe(true)
    expect(sq.containsPoint(new Vector2(15, 5))).toBe(false)
  })

  it('containsPoint returns false for open polyline', () => {
    const p = new Polyline([new Vector2(0, 0), new Vector2(10, 0), new Vector2(10, 10)])
    expect(p.containsPoint(new Vector2(5, 5))).toBe(false)
  })

  it('simplify (Douglas-Peucker)', () => {
    const p = new Polyline([
      new Vector2(0, 0), new Vector2(1, 0.1),
      new Vector2(2, -0.1), new Vector2(3, 0),
    ])
    const simplified = p.simplify(0.5)
    expect(simplified.points.length).toBeLessThan(p.points.length)
    expect(simplified.points[0].x).toBe(0)
    expect(simplified.points[simplified.points.length - 1].x).toBe(3)
  })

  it('reverse', () => {
    const p = new Polyline([new Vector2(0, 0), new Vector2(1, 0), new Vector2(2, 0)])
    const rev = p.reverse()
    expect(rev.points[0].x).toBe(2)
    expect(rev.points[2].x).toBe(0)
  })
})
