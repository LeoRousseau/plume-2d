import { describe, it, expect, vi } from 'vitest'
import { Rectangle } from './Rectangle'
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
}

describe('Rectangle', () => {
  it('computes area', () => {
    const r = new Rectangle(new Vector2(), 4, 5)
    expect(r.area()).toBe(20)
  })

  it('computes perimeter', () => {
    const r = new Rectangle(new Vector2(), 4, 5)
    expect(r.perimeter()).toBe(18)
  })

  it('containsPoint', () => {
    const r = new Rectangle(new Vector2(1, 1), 4, 3)
    expect(r.containsPoint(new Vector2(3, 2))).toBe(true)
    expect(r.containsPoint(new Vector2(6, 2))).toBe(false)
  })

  it('getBoundingBox', () => {
    const r = new Rectangle(new Vector2(2, 3), 5, 7)
    const bb = r.getBoundingBox()
    expect(bb.min.x).toBe(2)
    expect(bb.min.y).toBe(3)
    expect(bb.max.x).toBe(7)
    expect(bb.max.y).toBe(10)
  })

  it('toPolyline', () => {
    const r = new Rectangle(new Vector2(0, 0), 4, 3)
    const p = r.toPolyline()
    expect(p.points).toHaveLength(4)
    expect(p.isClosed).toBe(true)
  })

  it('calls renderer.drawRectangle on draw', () => {
    const r = new Rectangle()
    r.draw(mockRenderer)
    expect(mockRenderer.drawRectangle).toHaveBeenCalledWith(r)
  })
})
