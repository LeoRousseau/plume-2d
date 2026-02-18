import { describe, it, expect, vi } from 'vitest'
import { Polyline } from './Polyline'
import { Vector2 } from '../math/Vector2'
import type { IRenderer } from '../rendering/IRenderer'

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

  it('has default shape properties', () => {
    const p = new Polyline()
    expect(p.fillColor).toBe('transparent')
    expect(p.strokeColor).toBe('#ffffff')
    expect(p.strokeWidth).toBe(1)
  })

  it('calls renderer.drawPolyline on draw', () => {
    const p = new Polyline([new Vector2(0, 0), new Vector2(1, 1)])
    const mockRenderer: IRenderer = {
      render: vi.fn(),
      drawPolyline: vi.fn(),
    }
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
})
