import { describe, it, expect } from 'vitest'
import { View } from './View'

describe('View', () => {
  it('creates with correct dimensions', () => {
    const view = new View(800, 600)
    expect(view.width).toBe(800)
    expect(view.height).toBe(600)
  })

  it('center defaults to half width/height', () => {
    const view = new View(800, 600)
    expect(view.center.x).toBe(400)
    expect(view.center.y).toBe(300)
  })

  it('zoom defaults to 1', () => {
    const view = new View(800, 600)
    expect(view.zoom).toBe(1)
  })
})
