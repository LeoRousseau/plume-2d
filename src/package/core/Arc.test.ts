import { describe, it, expect, vi } from 'vitest'
import { Arc } from './Arc'
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

describe('Arc', () => {
  it('computes arcLength', () => {
    const a = new Arc(new Vector2(), 10, 0, Math.PI)
    expect(a.arcLength()).toBeCloseTo(10 * Math.PI)
  })

  it('startPoint and endPoint', () => {
    const a = new Arc(new Vector2(0, 0), 5, 0, Math.PI / 2)
    const sp = a.startPoint()
    expect(sp.x).toBeCloseTo(5)
    expect(sp.y).toBeCloseTo(0)
    const ep = a.endPoint()
    expect(ep.x).toBeCloseTo(0)
    expect(ep.y).toBeCloseTo(5)
  })

  it('getBoundingBox', () => {
    const a = new Arc(new Vector2(0, 0), 10, 0, Math.PI / 2)
    const bb = a.getBoundingBox()
    expect(bb.min.x).toBeCloseTo(0)
    expect(bb.min.y).toBeCloseTo(0)
    expect(bb.max.x).toBeCloseTo(10)
    expect(bb.max.y).toBeCloseTo(10)
  })

  it('containsPoint on the arc curve', () => {
    const a = new Arc(new Vector2(0, 0), 10, 0, Math.PI / 2)
    // Point on the arc at angle 0 (10, 0)
    expect(a.containsPoint(new Vector2(10, 0))).toBe(true)
    // Point on the arc at angle π/4
    expect(a.containsPoint(new Vector2(10 * Math.cos(Math.PI / 4), 10 * Math.sin(Math.PI / 4)))).toBe(true)
    // Point far from the arc
    expect(a.containsPoint(new Vector2(0, 0))).toBe(false)
    // Point at correct distance but wrong angle
    expect(a.containsPoint(new Vector2(-10, 0))).toBe(false)
  })

  it('calls renderer.drawArc on draw', () => {
    const a = new Arc()
    a.draw(mockRenderer)
    expect(mockRenderer.drawArc).toHaveBeenCalledWith(a)
  })
})
