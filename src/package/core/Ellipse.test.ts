import { describe, it, expect, vi } from 'vitest'
import { Ellipse } from './Ellipse'
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

describe('Ellipse', () => {
  it('computes area', () => {
    const e = new Ellipse(new Vector2(), 3, 5)
    expect(e.area()).toBeCloseTo(Math.PI * 15)
  })

  it('perimeter (Ramanujan)', () => {
    // Circle case: rx === ry should match 2πr
    const e = new Ellipse(new Vector2(), 5, 5)
    expect(e.perimeter()).toBeCloseTo(2 * Math.PI * 5, 1)
  })

  it('containsPoint', () => {
    const e = new Ellipse(new Vector2(0, 0), 4, 2)
    expect(e.containsPoint(new Vector2(3, 0))).toBe(true)
    expect(e.containsPoint(new Vector2(0, 1.5))).toBe(true)
    expect(e.containsPoint(new Vector2(5, 0))).toBe(false)
  })

  it('getBoundingBox', () => {
    const e = new Ellipse(new Vector2(10, 20), 3, 5)
    const bb = e.getBoundingBox()
    expect(bb.min.x).toBe(7)
    expect(bb.min.y).toBe(15)
    expect(bb.max.x).toBe(13)
    expect(bb.max.y).toBe(25)
  })

  it('calls renderer.drawEllipse on draw', () => {
    const e = new Ellipse()
    e.draw(mockRenderer)
    expect(mockRenderer.drawEllipse).toHaveBeenCalledWith(e)
  })
})
