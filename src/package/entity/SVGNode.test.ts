import { describe, it, expect, vi } from 'vitest'
import { SVGNode } from './SVGNode'
import { Vector2 } from '../math/Vector2'
import { Scene } from '../core/Scene'
import { pick } from '../hitTest/HitTest'
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

const testSVG = '<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><circle cx="50" cy="50" r="40" fill="red"/></svg>'

describe('SVGNode', () => {
  it('creates with explicit size', () => {
    const n = new SVGNode(testSVG, new Vector2(10, 20), 200, 150)
    expect(n.origin.x).toBe(10)
    expect(n.origin.y).toBe(20)
    expect(n.width).toBe(200)
    expect(n.height).toBe(150)
    expect(n.svg).toBe(testSVG)
  })

  it('defaults to 100x100 at origin', () => {
    const n = new SVGNode(testSVG)
    expect(n.origin.x).toBe(0)
    expect(n.origin.y).toBe(0)
    expect(n.width).toBe(100)
    expect(n.height).toBe(100)
  })

  it('computes bounding box', () => {
    const n = new SVGNode(testSVG, new Vector2(10, 20), 100, 50)
    const bb = n.getBoundingBox()
    expect(bb.min.x).toBe(10)
    expect(bb.min.y).toBe(20)
    expect(bb.max.x).toBe(110)
    expect(bb.max.y).toBe(70)
  })

  it('containsPoint inside', () => {
    const n = new SVGNode(testSVG, new Vector2(0, 0), 100, 100)
    expect(n.containsPoint(new Vector2(50, 50))).toBe(true)
  })

  it('containsPoint outside', () => {
    const n = new SVGNode(testSVG, new Vector2(0, 0), 100, 100)
    expect(n.containsPoint(new Vector2(150, 50))).toBe(false)
  })

  it('calls drawSVGNode on renderer', () => {
    const n = new SVGNode(testSVG)
    n.draw(mockRenderer)
    expect(mockRenderer.drawSVGNode).toHaveBeenCalledWith(n)
  })

  it('has no fill and no stroke by default', () => {
    const n = new SVGNode(testSVG)
    expect(n.fill).toBeNull()
    expect(n.stroke.width).toBe(0)
  })

  it('cache is null initially', () => {
    const n = new SVGNode(testSVG)
    expect(n._cache).toBeNull()
    expect(n._cacheZoom).toBe(0)
  })

  it('invalidate clears cache', () => {
    const n = new SVGNode(testSVG)
    n._cacheZoom = 2
    n.invalidate()
    expect(n._cache).toBeNull()
    expect(n._cacheZoom).toBe(0)
  })

  it('is hit-testable via pick', () => {
    const scene = new Scene()
    const n = new SVGNode(testSVG, new Vector2(10, 10), 100, 100)
    scene.root.addChild(n)

    const hit = pick(scene, new Vector2(50, 50))
    expect(hit).not.toBeNull()
    expect(hit!.shape).toBe(n)
  })

  it('is not hit when outside bounds', () => {
    const scene = new Scene()
    const n = new SVGNode(testSVG, new Vector2(10, 10), 100, 100)
    scene.root.addChild(n)

    const hit = pick(scene, new Vector2(200, 200))
    expect(hit).toBeNull()
  })
})
