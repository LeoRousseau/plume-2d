import { describe, it, expect, vi } from 'vitest'
import { Arc } from './Arc'
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

describe('Arc', () => {
  it('computes perimeter', () => {
    const a = new Arc(new Vector2(), 10, 0, Math.PI)
    expect(a.perimeter()).toBeCloseTo(10 * Math.PI)
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

  it('containsPoint with custom tolerance', () => {
    const a = new Arc(new Vector2(0, 0), 10, 0, Math.PI / 2)
    // Point at distance 12 from center (2 units from arc edge)
    expect(a.containsPoint(new Vector2(12, 0), 3)).toBe(true)
    expect(a.containsPoint(new Vector2(12, 0), 1)).toBe(false)
  })

  it('containsPoint on arc crossing 0 degrees (wrap-around)', () => {
    // Arc from 350° to 10° (small arc crossing 0°)
    const deg = (d: number) => d * Math.PI / 180
    const a = new Arc(new Vector2(0, 0), 10, deg(350), deg(10))

    // Point at angle 0° (on the arc)
    expect(a.containsPoint(new Vector2(10, 0))).toBe(true)
    // Point at angle 355° (on the arc)
    expect(a.containsPoint(new Vector2(10 * Math.cos(deg(355)), 10 * Math.sin(deg(355))))).toBe(true)
    // Point at angle 5° (on the arc)
    expect(a.containsPoint(new Vector2(10 * Math.cos(deg(5)), 10 * Math.sin(deg(5))))).toBe(true)
    // Point at angle 180° (NOT on the arc)
    expect(a.containsPoint(new Vector2(-10, 0))).toBe(false)
    // Point at angle 90° (NOT on the arc)
    expect(a.containsPoint(new Vector2(0, 10))).toBe(false)
  })

  it('containsPoint with negative start angle', () => {
    // Arc from -π/4 to π/4 (crossing 0°)
    const a = new Arc(new Vector2(0, 0), 10, -Math.PI / 4, Math.PI / 4)
    // Point at angle 0° (on the arc)
    expect(a.containsPoint(new Vector2(10, 0))).toBe(true)
    // Point at angle π (NOT on the arc)
    expect(a.containsPoint(new Vector2(-10, 0))).toBe(false)
  })

  it('containsPoint on full circle arc', () => {
    const a = new Arc(new Vector2(0, 0), 10, 0, Math.PI * 2)
    // Every angle should be on the arc
    expect(a.containsPoint(new Vector2(10, 0))).toBe(true)
    expect(a.containsPoint(new Vector2(0, 10))).toBe(true)
    expect(a.containsPoint(new Vector2(-10, 0))).toBe(true)
    expect(a.containsPoint(new Vector2(0, -10))).toBe(true)
  })

  it('containsPoint on arc > π (large sweep)', () => {
    // Arc from 0 to 270° (3/4 of circle)
    const a = new Arc(new Vector2(0, 0), 10, 0, 3 * Math.PI / 2)
    expect(a.containsPoint(new Vector2(10, 0))).toBe(true)   // 0°
    expect(a.containsPoint(new Vector2(0, 10))).toBe(true)    // 90°
    expect(a.containsPoint(new Vector2(-10, 0))).toBe(true)   // 180°
    expect(a.containsPoint(new Vector2(0, -10))).toBe(true)   // 270° = end angle (inclusive)
    // Point just past the end at ~280° should NOT be on the arc
    const deg280 = 280 * Math.PI / 180
    expect(a.containsPoint(new Vector2(10 * Math.cos(deg280), 10 * Math.sin(deg280)))).toBe(false)
  })

  it('area of semicircle sector', () => {
    const a = new Arc(new Vector2(0, 0), 10, 0, Math.PI)
    // Area = 0.5 * r² * θ = 0.5 * 100 * π
    expect(a.area()).toBeCloseTo(50 * Math.PI)
  })

  it('calls renderer.drawArc on draw', () => {
    const a = new Arc()
    a.draw(mockRenderer)
    expect(mockRenderer.drawArc).toHaveBeenCalledWith(a)
  })
})
