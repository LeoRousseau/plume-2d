import { describe, it, expect, vi } from 'vitest'
import { Text } from './Text'
import { Vector2 } from '../math/Vector2'
import { Scene } from '../core/Scene'
import { pick } from '../hitTest/HitTest'
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

describe('Text', () => {
  it('creates with defaults', () => {
    const t = new Text()
    expect(t.content).toBe('')
    expect(t.fontSize).toBe(16)
    expect(t.fontFamily).toBe('sans-serif')
    expect(t.textAlign).toBe('left')
    expect(t.textBaseline).toBe('alphabetic')
    expect(t.fill.color).toBe('#ffffff')
    expect(t.stroke.color).toBe('transparent')
  })

  it('creates with content and position', () => {
    const t = new Text('Hello', new Vector2(100, 200), 24, 'monospace')
    expect(t.content).toBe('Hello')
    expect(t.position.x).toBe(100)
    expect(t.fontSize).toBe(24)
    expect(t.fontFamily).toBe('monospace')
  })

  it('computes font shorthand', () => {
    const t = new Text('test', new Vector2(), 20, 'Arial')
    expect(t.font).toBe('20px Arial')
  })

  it('calls renderer.drawText on draw', () => {
    const t = new Text('hi')
    t.draw(mockRenderer)
    expect(mockRenderer.drawText).toHaveBeenCalledWith(t)
  })

  it('getBoundingBox for left-aligned text', () => {
    const t = new Text('ABC', new Vector2(10, 50), 20)
    t.textAlign = 'left'
    t.textBaseline = 'top'
    const bb = t.getBoundingBox()
    expect(bb.min.x).toBe(10)
    expect(bb.min.y).toBe(50)
    expect(bb.width).toBeGreaterThan(0)
    expect(bb.height).toBe(20)
  })

  it('getBoundingBox for center-aligned text', () => {
    const t = new Text('AB', new Vector2(100, 50), 20)
    t.textAlign = 'center'
    t.textBaseline = 'top'
    const bb = t.getBoundingBox()
    expect(bb.center().x).toBeCloseTo(100)
  })

  it('getBoundingBox for right-aligned text', () => {
    const t = new Text('AB', new Vector2(100, 50), 20)
    t.textAlign = 'right'
    t.textBaseline = 'top'
    const bb = t.getBoundingBox()
    expect(bb.max.x).toBeCloseTo(100)
  })

  it('is hit-testable via pick', () => {
    const scene = new Scene()
    const t = new Text('Hello', new Vector2(10, 50), 20)
    t.textAlign = 'left'
    t.textBaseline = 'top'
    scene.root.addChild(t)

    expect(pick(scene, new Vector2(20, 60))).not.toBeNull()
    expect(pick(scene, new Vector2(20, 60))!.shape).toBe(t)
    expect(pick(scene, new Vector2(500, 500))).toBeNull()
  })
})
