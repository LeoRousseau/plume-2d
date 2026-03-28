import { describe, it, expect, vi } from 'vitest'
import { Raster } from './Raster'
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
}

function mockImage(naturalWidth = 100, naturalHeight = 80): HTMLImageElement {
  return { naturalWidth, naturalHeight, src: 'test.png' } as unknown as HTMLImageElement
}

describe('Raster', () => {
  it('creates with explicit size', () => {
    const r = new Raster(mockImage(), new Vector2(10, 20), 200, 150)
    expect(r.origin.x).toBe(10)
    expect(r.origin.y).toBe(20)
    expect(r.width).toBe(200)
    expect(r.height).toBe(150)
  })

  it('defaults size to naturalWidth/Height', () => {
    const r = new Raster(mockImage(320, 240))
    expect(r.width).toBe(320)
    expect(r.height).toBe(240)
  })

  it('defaults origin to (0,0)', () => {
    const r = new Raster(mockImage())
    expect(r.origin.x).toBe(0)
    expect(r.origin.y).toBe(0)
  })

  it('computes bounding box', () => {
    const r = new Raster(mockImage(), new Vector2(10, 20), 100, 50)
    const bb = r.getBoundingBox()
    expect(bb.min.x).toBe(10)
    expect(bb.min.y).toBe(20)
    expect(bb.max.x).toBe(110)
    expect(bb.max.y).toBe(70)
  })

  it('containsPoint inside', () => {
    const r = new Raster(mockImage(), new Vector2(0, 0), 100, 80)
    expect(r.containsPoint(new Vector2(50, 40))).toBe(true)
  })

  it('containsPoint outside', () => {
    const r = new Raster(mockImage(), new Vector2(0, 0), 100, 80)
    expect(r.containsPoint(new Vector2(150, 40))).toBe(false)
  })

  it('containsPoint on edge', () => {
    const r = new Raster(mockImage(), new Vector2(0, 0), 100, 80)
    expect(r.containsPoint(new Vector2(100, 80))).toBe(true)
  })

  it('calls drawImage on renderer', () => {
    const r = new Raster(mockImage(), new Vector2(0, 0), 100, 80)
    r.draw(mockRenderer)
    expect(mockRenderer.drawImage).toHaveBeenCalledWith(r)
  })

  it('has no fill and no stroke by default', () => {
    const r = new Raster(mockImage())
    expect(r.fill).toBeNull()
    expect(r.stroke.width).toBe(0)
  })

  it('is hit-testable via pick', () => {
    const scene = new Scene()
    const r = new Raster(mockImage(), new Vector2(10, 10), 100, 80)
    scene.root.addChild(r)

    const hit = pick(scene, new Vector2(50, 50))
    expect(hit).not.toBeNull()
    expect(hit!.shape).toBe(r)
  })

  it('is not hit when outside bounds', () => {
    const scene = new Scene()
    const r = new Raster(mockImage(), new Vector2(10, 10), 100, 80)
    scene.root.addChild(r)

    const hit = pick(scene, new Vector2(200, 200))
    expect(hit).toBeNull()
  })
})
