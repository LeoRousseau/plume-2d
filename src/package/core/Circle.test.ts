import { describe, it, expect, vi } from 'vitest'
import { Circle } from './Circle'
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

describe('Circle', () => {
  it('creates with defaults', () => {
    const c = new Circle()
    expect(c.center.x).toBe(0)
    expect(c.radius).toBe(1)
  })

  it('computes area', () => {
    const c = new Circle(new Vector2(), 5)
    expect(c.area()).toBeCloseTo(Math.PI * 25)
  })

  it('computes circumference', () => {
    const c = new Circle(new Vector2(), 3)
    expect(c.circumference()).toBeCloseTo(2 * Math.PI * 3)
  })

  it('containsPoint', () => {
    const c = new Circle(new Vector2(0, 0), 10)
    expect(c.containsPoint(new Vector2(5, 0))).toBe(true)
    expect(c.containsPoint(new Vector2(11, 0))).toBe(false)
  })

  it('getBoundingBox', () => {
    const c = new Circle(new Vector2(5, 5), 3)
    const bb = c.getBoundingBox()
    expect(bb.min.x).toBe(2)
    expect(bb.min.y).toBe(2)
    expect(bb.max.x).toBe(8)
    expect(bb.max.y).toBe(8)
  })

  it('calls renderer.drawCircle on draw', () => {
    const c = new Circle(new Vector2(0, 0), 5)
    c.draw(mockRenderer)
    expect(mockRenderer.drawCircle).toHaveBeenCalledWith(c)
  })
})
