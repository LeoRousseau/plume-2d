import { describe, it, expect } from 'vitest'
import { Transform } from './Transform'
import { Vector2 } from '../math/Vector2'
import { Matrix } from '../math/Matrix'
import { Node } from './Node'

describe('Transform', () => {
  it('default constructor: position (0,0), rotation 0, scale (1,1)', () => {
    const t = new Transform()
    expect(t.position.x).toBe(0)
    expect(t.position.y).toBe(0)
    expect(t.rotation).toBe(0)
    expect(t.scale.x).toBe(1)
    expect(t.scale.y).toBe(1)
  })

  it('custom constructor values', () => {
    const t = new Transform(new Vector2(3, 4), Math.PI / 2, new Vector2(2, 3))
    expect(t.position.x).toBe(3)
    expect(t.position.y).toBe(4)
    expect(t.rotation).toBe(Math.PI / 2)
    expect(t.scale.x).toBe(2)
    expect(t.scale.y).toBe(3)
  })

  it('localMatrix is identity for default transform', () => {
    const t = new Transform()
    const m = t.localMatrix
    expect(m.a).toBeCloseTo(1)
    expect(m.b).toBeCloseTo(0)
    expect(m.c).toBeCloseTo(0)
    expect(m.d).toBeCloseTo(1)
    expect(m.tx).toBeCloseTo(0)
    expect(m.ty).toBeCloseTo(0)
  })

  it('localMatrix applies translation', () => {
    const t = new Transform(new Vector2(5, 7))
    const m = t.localMatrix
    expect(m.tx).toBeCloseTo(5)
    expect(m.ty).toBeCloseTo(7)
    // rotation/scale part stays identity
    expect(m.a).toBeCloseTo(1)
    expect(m.d).toBeCloseTo(1)
  })

  it('localMatrix applies rotation', () => {
    const angle = Math.PI / 4
    const t = new Transform(new Vector2(), angle)
    const m = t.localMatrix
    const cos = Math.cos(angle)
    const sin = Math.sin(angle)
    expect(m.a).toBeCloseTo(cos)
    expect(m.b).toBeCloseTo(sin)
    expect(m.c).toBeCloseTo(-sin)
    expect(m.d).toBeCloseTo(cos)
  })

  it('localMatrix applies scale', () => {
    const t = new Transform(new Vector2(), 0, new Vector2(3, 5))
    const m = t.localMatrix
    expect(m.a).toBeCloseTo(3)
    expect(m.d).toBeCloseTo(5)
    expect(m.b).toBeCloseTo(0)
    expect(m.c).toBeCloseTo(0)
  })

  it('localMatrix composes T*R*S correctly', () => {
    const pos = new Vector2(10, 20)
    const rot = Math.PI / 6
    const scl = new Vector2(2, 3)
    const t = new Transform(pos, rot, scl)
    const m = t.localMatrix

    const expected = Matrix.compose(pos, rot, scl)
    expect(m.a).toBeCloseTo(expected.a)
    expect(m.b).toBeCloseTo(expected.b)
    expect(m.c).toBeCloseTo(expected.c)
    expect(m.d).toBeCloseTo(expected.d)
    expect(m.tx).toBeCloseTo(expected.tx)
    expect(m.ty).toBeCloseTo(expected.ty)
  })

  it('worldMatrix equals localMatrix when no parent', () => {
    const node = new Node()
    node.transform.position.set(5, 10)
    const world = node.transform.worldMatrix
    const local = node.transform.localMatrix
    expect(world.a).toBeCloseTo(local.a)
    expect(world.b).toBeCloseTo(local.b)
    expect(world.c).toBeCloseTo(local.c)
    expect(world.d).toBeCloseTo(local.d)
    expect(world.tx).toBeCloseTo(local.tx)
    expect(world.ty).toBeCloseTo(local.ty)
  })

  it('worldMatrix multiplies parent worldMatrix with local', () => {
    const parent = new Node()
    const child = new Node()
    parent.addChild(child)

    parent.transform.position.set(100, 200)
    child.transform.position.set(10, 20)

    const world = child.transform.worldMatrix
    const expected = parent.transform.worldMatrix.multiply(child.transform.localMatrix)

    expect(world.a).toBeCloseTo(expected.a)
    expect(world.b).toBeCloseTo(expected.b)
    expect(world.c).toBeCloseTo(expected.c)
    expect(world.d).toBeCloseTo(expected.d)
    expect(world.tx).toBeCloseTo(expected.tx)
    expect(world.ty).toBeCloseTo(expected.ty)
  })

  it('worldMatrix with 3-level deep hierarchy', () => {
    const grandparent = new Node()
    const parent = new Node()
    const child = new Node()
    grandparent.addChild(parent)
    parent.addChild(child)

    grandparent.transform.position.set(1, 0)
    parent.transform.position.set(2, 0)
    child.transform.position.set(3, 0)

    const world = child.transform.worldMatrix
    // With no rotation/scale, translations should accumulate: 1+2+3 = 6
    expect(world.tx).toBeCloseTo(6)
    expect(world.ty).toBeCloseTo(0)
  })

  it('worldMatrix with parent that has rotation + translation', () => {
    const parent = new Node()
    const child = new Node()
    parent.addChild(child)

    parent.transform.position.set(10, 0)
    parent.transform.rotation = Math.PI / 2 // 90 degrees
    child.transform.position.set(5, 0)

    const world = child.transform.worldMatrix
    // Parent translates to (10,0) then rotates 90 deg.
    // Child's local offset (5,0) rotated 90 deg becomes (0,5).
    // So world position should be (10, 5).
    expect(world.tx).toBeCloseTo(10)
    expect(world.ty).toBeCloseTo(5)
  })
})
