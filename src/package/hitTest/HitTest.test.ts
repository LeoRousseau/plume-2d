import { describe, it, expect } from 'vitest'
import { Vector2 } from '../math/Vector2'
import { Node } from '../core/Node'
import { Scene } from '../core/Scene'
import { Polyline } from '../entity/Polyline'
import { Circle } from '../entity/Circle'
import { Rectangle } from '../entity/Rectangle'
import { Ellipse } from '../entity/Ellipse'
import { Arc } from '../entity/Arc'
import { Path } from '../entity/Path'
import { Text } from '../entity/Text'
import { pick } from './HitTest'

describe('HitTest', () => {
  it('picks a filled circle', () => {
    const scene = new Scene()
    const c = new Circle(new Vector2(50, 50), 20)
    c.fill = { type: 'solid', color: '#f00' }
    scene.root.addChild(c)

    const hit = pick(scene, new Vector2(50, 50))
    expect(hit).not.toBeNull()
    expect(hit!.shape).toBe(c)
  })

  it('picks a stroked circle by its edge', () => {
    const scene = new Scene()
    const c = new Circle(new Vector2(50, 50), 20)
    c.fill = null
    scene.root.addChild(c)

    // On the edge
    const hit = pick(scene, new Vector2(70, 50), 2)
    expect(hit).not.toBeNull()
    expect(hit!.shape).toBe(c)

    // Far from edge
    const miss = pick(scene, new Vector2(50, 50), 2)
    expect(miss).toBeNull()
  })

  it('picks a filled rectangle', () => {
    const scene = new Scene()
    const r = new Rectangle(new Vector2(10, 10), 40, 30)
    r.fill = { type: 'solid', color: '#0f0' }
    scene.root.addChild(r)

    expect(pick(scene, new Vector2(30, 25))?.shape).toBe(r)
    expect(pick(scene, new Vector2(100, 100))).toBeNull()
  })

  it('picks a stroked rectangle by edge', () => {
    const scene = new Scene()
    const r = new Rectangle(new Vector2(10, 10), 40, 30)
    r.fill = null
    scene.root.addChild(r)

    // On top edge
    expect(pick(scene, new Vector2(30, 10), 2)?.shape).toBe(r)
    // Center (not filled)
    expect(pick(scene, new Vector2(30, 25), 2)).toBeNull()
  })

  it('picks a closed polyline', () => {
    const scene = new Scene()
    const p = new Polyline([
      new Vector2(0, 0), new Vector2(20, 0),
      new Vector2(20, 20), new Vector2(0, 20),
    ], true)
    p.fill = { type: 'solid', color: '#00f' }
    scene.root.addChild(p)

    expect(pick(scene, new Vector2(10, 10))?.shape).toBe(p)
    expect(pick(scene, new Vector2(50, 50))).toBeNull()
  })

  it('picks an open polyline by proximity', () => {
    const scene = new Scene()
    const p = new Polyline([new Vector2(0, 0), new Vector2(100, 0)])
    scene.root.addChild(p)

    expect(pick(scene, new Vector2(50, 1), 2)?.shape).toBe(p)
    expect(pick(scene, new Vector2(50, 10), 2)).toBeNull()
  })

  it('picks a filled ellipse', () => {
    const scene = new Scene()
    const e = new Ellipse(new Vector2(50, 50), 30, 20)
    e.fill = { type: 'solid', color: '#ff0' }
    scene.root.addChild(e)

    expect(pick(scene, new Vector2(50, 50))?.shape).toBe(e)
    expect(pick(scene, new Vector2(100, 100))).toBeNull()
  })

  it('picks an arc by proximity', () => {
    const scene = new Scene()
    const a = new Arc(new Vector2(50, 50), 30, 0, Math.PI)
    scene.root.addChild(a)

    // Point on the arc at angle 0
    expect(pick(scene, new Vector2(80, 50), 2)?.shape).toBe(a)
    // Far away
    expect(pick(scene, new Vector2(0, 0), 2)).toBeNull()
  })

  it('picks a closed path', () => {
    const scene = new Scene()
    const p = new Path()
      .moveTo(new Vector2(0, 0))
      .lineTo(new Vector2(20, 0))
      .lineTo(new Vector2(20, 20))
      .lineTo(new Vector2(0, 20))
      .close()
    p.fill = { type: 'solid', color: '#f0f' }
    scene.root.addChild(p)

    expect(pick(scene, new Vector2(10, 10))?.shape).toBe(p)
    expect(pick(scene, new Vector2(50, 50))).toBeNull()
  })

  it('returns top-most shape when overlapping', () => {
    const scene = new Scene()
    const c1 = new Circle(new Vector2(50, 50), 30)
    c1.fill = { type: 'solid', color: '#f00' }
    const c2 = new Circle(new Vector2(50, 50), 20)
    c2.fill = { type: 'solid', color: '#0f0' }
    scene.root.addChild(c1)
    scene.root.addChild(c2) // c2 is on top

    expect(pick(scene, new Vector2(50, 50))?.shape).toBe(c2)
  })

  it('picks a text shape', () => {
    const scene = new Scene()
    const t = new Text('Hello', new Vector2(10, 50), 20)
    t.textAlign = 'left'
    t.textBaseline = 'top'
    scene.root.addChild(t)

    expect(pick(scene, new Vector2(20, 60))?.shape).toBe(t)
    expect(pick(scene, new Vector2(500, 500))).toBeNull()
  })

  it('picks a shape with transform', () => {
    const scene = new Scene()
    const c = new Circle(new Vector2(0, 0), 20)
    c.fill = { type: 'solid', color: '#f00' }
    c.transform.position = new Vector2(100, 100)
    scene.root.addChild(c)

    expect(pick(scene, new Vector2(100, 100))?.shape).toBe(c)
    expect(pick(scene, new Vector2(0, 0))).toBeNull()
  })

  it('returns null for non-invertible transform', () => {
    const scene = new Scene()
    const c = new Circle(new Vector2(0, 0), 20)
    c.fill = { type: 'solid', color: '#f00' }
    c.transform.scale = new Vector2(0, 0)
    scene.root.addChild(c)

    expect(pick(scene, new Vector2(0, 0))).toBeNull()
  })

  it('returns null on empty scene', () => {
    const scene = new Scene()

    expect(pick(scene, new Vector2(50, 50))).toBeNull()
  })

  it('skips invisible nodes', () => {
    const scene = new Scene()
    const c = new Circle(new Vector2(50, 50), 20)
    c.fill = { type: 'solid', color: '#f00' }
    scene.root.addChild(c)

    c.visible = false
    expect(pick(scene, new Vector2(50, 50))).toBeNull()

    c.visible = true
    expect(pick(scene, new Vector2(50, 50))?.shape).toBe(c)
  })

  it('skips children of invisible parent', () => {
    const scene = new Scene()
    const group = new Node()
    const c = new Circle(new Vector2(50, 50), 20)
    c.fill = { type: 'solid', color: '#f00' }
    group.addChild(c)
    scene.root.addChild(group)

    group.visible = false
    expect(pick(scene, new Vector2(50, 50))).toBeNull()
  })
})
