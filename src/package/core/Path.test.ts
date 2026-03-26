import { describe, it, expect, vi } from 'vitest'
import { Path } from './Path'
import { Vector2 } from '../math/Vector2'
import type { IRenderer } from '../rendering/IRenderer'

const mockRenderer: IRenderer = {
  render: vi.fn(),
  drawPolyline: vi.fn(),
  drawCircle: vi.fn(),
  drawRectangle: vi.fn(),
  drawEllipse: vi.fn(),
  drawArc: vi.fn(),
  drawPath: vi.fn(),
  drawText: vi.fn(),
}

describe('Path', () => {
  it('builder API', () => {
    const p = new Path()
      .moveTo(new Vector2(0, 0))
      .lineTo(new Vector2(10, 0))
      .lineTo(new Vector2(10, 10))
      .close()
    expect(p.segments).toHaveLength(4)
    expect(p.segments[0].type).toBe('moveTo')
    expect(p.segments[3].type).toBe('close')
  })

  it('computes length for line segments', () => {
    const p = new Path()
      .moveTo(new Vector2(0, 0))
      .lineTo(new Vector2(3, 0))
      .lineTo(new Vector2(3, 4))
    expect(p.length()).toBeCloseTo(7)
  })

  it('getBoundingBox', () => {
    const p = new Path()
      .moveTo(new Vector2(0, 0))
      .lineTo(new Vector2(10, 0))
      .lineTo(new Vector2(10, 10))
    const bb = p.getBoundingBox()
    expect(bb.min.x).toBe(0)
    expect(bb.min.y).toBe(0)
    expect(bb.max.x).toBe(10)
    expect(bb.max.y).toBe(10)
  })

  it('calls renderer.drawPath on draw', () => {
    const p = new Path().moveTo(new Vector2(0, 0))
    p.draw(mockRenderer)
    expect(mockRenderer.drawPath).toHaveBeenCalledWith(p)
  })

  it('containsPoint for closed path', () => {
    // Closed triangle path
    const p = new Path()
      .moveTo(new Vector2(0, 0))
      .lineTo(new Vector2(10, 0))
      .lineTo(new Vector2(5, 10))
      .close()
    expect(p.containsPoint(new Vector2(5, 3))).toBe(true)
    expect(p.containsPoint(new Vector2(20, 20))).toBe(false)
  })

  it('containsPoint returns false for open path', () => {
    const p = new Path()
      .moveTo(new Vector2(0, 0))
      .lineTo(new Vector2(10, 0))
      .lineTo(new Vector2(5, 10))
    expect(p.containsPoint(new Vector2(5, 3))).toBe(false)
  })

  it('toPolylinePoints linearizes curves', () => {
    const p = new Path()
      .moveTo(new Vector2(0, 0))
      .quadraticTo(new Vector2(5, 10), new Vector2(10, 0))
    const pts = p.toPolylinePoints()
    expect(pts.length).toBeGreaterThan(2)
    expect(pts[0].x).toBe(0)
    expect(pts[pts.length - 1].x).toBeCloseTo(10)
  })

  it('supports quadratic and cubic curves', () => {
    const p = new Path()
      .moveTo(new Vector2(0, 0))
      .quadraticTo(new Vector2(5, 10), new Vector2(10, 0))
      .cubicTo(new Vector2(15, 10), new Vector2(20, 10), new Vector2(25, 0))
    expect(p.segments).toHaveLength(3)
    expect(p.length()).toBeGreaterThan(0)
  })
})
