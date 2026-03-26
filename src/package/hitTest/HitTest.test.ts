import { describe, it, expect } from 'vitest'
import { Vector2 } from '../math/Vector2'
import { Scene } from '../core/Scene'
import { Polyline } from '../entity/Polyline'
import { Circle } from '../entity/Circle'
import { Rectangle } from '../entity/Rectangle'
import { Ellipse } from '../entity/Ellipse'
import { Arc } from '../entity/Arc'
import { Path } from '../entity/Path'

describe('HitTest', () => {
  it('picks a filled circle', () => {
    const scene = new Scene()
    const c = new Circle(new Vector2(50, 50), 20)
    c.fill = { color: '#f00' }
    scene.root.addChild(c)

    const hit = scene.pick(new Vector2(50, 50))
    expect(hit).not.toBeNull()
    expect(hit!.shape).toBe(c)
  })

  it('picks a stroked circle by its edge', () => {
    const scene = new Scene()
    const c = new Circle(new Vector2(50, 50), 20)
    c.fill = { color: 'transparent' }
    scene.root.addChild(c)

    // On the edge
    const hit = scene.pick(new Vector2(70, 50), 2)
    expect(hit).not.toBeNull()
    expect(hit!.shape).toBe(c)

    // Far from edge
    const miss = scene.pick(new Vector2(50, 50), 2)
    expect(miss).toBeNull()
  })

  it('picks a filled rectangle', () => {
    const scene = new Scene()
    const r = new Rectangle(new Vector2(10, 10), 40, 30)
    r.fill = { color: '#0f0' }
    scene.root.addChild(r)

    expect(scene.pick(new Vector2(30, 25))?.shape).toBe(r)
    expect(scene.pick(new Vector2(100, 100))).toBeNull()
  })

  it('picks a stroked rectangle by edge', () => {
    const scene = new Scene()
    const r = new Rectangle(new Vector2(10, 10), 40, 30)
    r.fill = { color: 'transparent' }
    scene.root.addChild(r)

    // On top edge
    expect(scene.pick(new Vector2(30, 10), 2)?.shape).toBe(r)
    // Center (not filled)
    expect(scene.pick(new Vector2(30, 25), 2)).toBeNull()
  })

  it('picks a closed polyline', () => {
    const scene = new Scene()
    const p = new Polyline([
      new Vector2(0, 0), new Vector2(20, 0),
      new Vector2(20, 20), new Vector2(0, 20),
    ], true)
    p.fill = { color: '#00f' }
    scene.root.addChild(p)

    expect(scene.pick(new Vector2(10, 10))?.shape).toBe(p)
    expect(scene.pick(new Vector2(50, 50))).toBeNull()
  })

  it('picks an open polyline by proximity', () => {
    const scene = new Scene()
    const p = new Polyline([new Vector2(0, 0), new Vector2(100, 0)])
    scene.root.addChild(p)

    expect(scene.pick(new Vector2(50, 1), 2)?.shape).toBe(p)
    expect(scene.pick(new Vector2(50, 10), 2)).toBeNull()
  })

  it('picks a filled ellipse', () => {
    const scene = new Scene()
    const e = new Ellipse(new Vector2(50, 50), 30, 20)
    e.fill = { color: '#ff0' }
    scene.root.addChild(e)

    expect(scene.pick(new Vector2(50, 50))?.shape).toBe(e)
    expect(scene.pick(new Vector2(100, 100))).toBeNull()
  })

  it('picks an arc by proximity', () => {
    const scene = new Scene()
    const a = new Arc(new Vector2(50, 50), 30, 0, Math.PI)
    scene.root.addChild(a)

    // Point on the arc at angle 0
    expect(scene.pick(new Vector2(80, 50), 2)?.shape).toBe(a)
    // Far away
    expect(scene.pick(new Vector2(0, 0), 2)).toBeNull()
  })

  it('picks a closed path', () => {
    const scene = new Scene()
    const p = new Path()
      .moveTo(new Vector2(0, 0))
      .lineTo(new Vector2(20, 0))
      .lineTo(new Vector2(20, 20))
      .lineTo(new Vector2(0, 20))
      .close()
    p.fill = { color: '#f0f' }
    scene.root.addChild(p)

    expect(scene.pick(new Vector2(10, 10))?.shape).toBe(p)
    expect(scene.pick(new Vector2(50, 50))).toBeNull()
  })

  it('returns top-most shape when overlapping', () => {
    const scene = new Scene()
    const c1 = new Circle(new Vector2(50, 50), 30)
    c1.fill = { color: '#f00' }
    const c2 = new Circle(new Vector2(50, 50), 20)
    c2.fill = { color: '#0f0' }
    scene.root.addChild(c1)
    scene.root.addChild(c2) // c2 is on top

    expect(scene.pick(new Vector2(50, 50))?.shape).toBe(c2)
  })
})
