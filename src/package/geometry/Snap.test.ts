import { describe, it, expect } from 'vitest'
import { Vector2 } from '../math/Vector2'
import { Polyline } from '../core/Polyline'
import { Circle } from '../core/Circle'
import { snap } from './Snap'

describe('snap', () => {
  it('snaps to grid', () => {
    const result = snap(new Vector2(12, 18), [], { gridSize: 10, tolerance: 15 })
    expect(result).not.toBeNull()
    expect(result!.type).toBe('grid')
    expect(result!.point.x).toBe(10)
    expect(result!.point.y).toBe(20)
  })

  it('snaps to point on polyline', () => {
    const poly = new Polyline([new Vector2(10, 10), new Vector2(20, 20)])
    const result = snap(new Vector2(11, 11), [poly], { snapToGrid: false, snapToEdges: false, tolerance: 5 })
    expect(result).not.toBeNull()
    expect(result!.type).toBe('point')
    expect(result!.point.x).toBe(10)
  })

  it('snaps to center of circle', () => {
    const c = new Circle(new Vector2(50, 50), 20)
    const result = snap(new Vector2(52, 48), [c], { snapToGrid: false, tolerance: 10 })
    expect(result).not.toBeNull()
    expect(result!.type).toBe('center')
    expect(result!.point.x).toBe(50)
  })

  it('returns null when nothing is within tolerance', () => {
    const result = snap(new Vector2(100.5, 100.5), [], { gridSize: 10, snapToGrid: true, tolerance: 0.1 })
    expect(result).toBeNull()
  })

  it('snaps to edge of polyline', () => {
    const poly = new Polyline([new Vector2(0, 0), new Vector2(100, 0)])
    const result = snap(new Vector2(50, 3), [poly], { snapToGrid: false, snapToPoints: false, snapToCenters: false, tolerance: 10 })
    expect(result).not.toBeNull()
    expect(result!.type).toBe('edge')
    expect(result!.point.y).toBeCloseTo(0)
  })
})
