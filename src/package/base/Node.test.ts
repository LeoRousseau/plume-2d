import { describe, it, expect } from 'vitest'
import { Node } from './Node'

describe('Node', () => {
  it('creates with unique auto-incremented id', () => {
    const a = new Node()
    const b = new Node()
    expect(b.id).toBe(a.id + 1)
  })

  it('has default transform (position 0,0, rotation 0, scale 1,1)', () => {
    const node = new Node()
    expect(node.transform.position.x).toBe(0)
    expect(node.transform.position.y).toBe(0)
    expect(node.transform.rotation).toBe(0)
    expect(node.transform.scale.x).toBe(1)
    expect(node.transform.scale.y).toBe(1)
  })

  it('transform.owner points back to the node', () => {
    const node = new Node()
    expect(node.transform.owner).toBe(node)
  })

  it('starts with empty children array and null parent', () => {
    const node = new Node()
    expect(node.children).toEqual([])
    expect(node.parent).toBeNull()
  })

  it('addChild sets parent reference', () => {
    const parent = new Node()
    const child = new Node()
    parent.addChild(child)
    expect(child.parent).toBe(parent)
  })

  it('addChild appends to children array', () => {
    const parent = new Node()
    const child = new Node()
    parent.addChild(child)
    expect(parent.children).toContain(child)
    expect(parent.children.length).toBe(1)
  })

  it('removeChild clears parent reference', () => {
    const parent = new Node()
    const child = new Node()
    parent.addChild(child)
    parent.removeChild(child)
    expect(child.parent).toBeNull()
  })

  it('removeChild removes from children array', () => {
    const parent = new Node()
    const child = new Node()
    parent.addChild(child)
    parent.removeChild(child)
    expect(parent.children).not.toContain(child)
    expect(parent.children.length).toBe(0)
  })

  it('removeChild on non-existent child does nothing', () => {
    const parent = new Node()
    const stranger = new Node()
    expect(() => parent.removeChild(stranger)).not.toThrow()
    expect(parent.children.length).toBe(0)
  })

  it('multiple children maintain order', () => {
    const parent = new Node()
    const a = new Node()
    const b = new Node()
    const c = new Node()
    parent.addChild(a)
    parent.addChild(b)
    parent.addChild(c)
    expect(parent.children[0]).toBe(a)
    expect(parent.children[1]).toBe(b)
    expect(parent.children[2]).toBe(c)
  })

  it('removeFromParent detaches from parent', () => {
    const parent = new Node()
    const child = new Node()
    parent.addChild(child)
    child.removeFromParent()
    expect(child.parent).toBeNull()
    expect(parent.children.length).toBe(0)
  })

  it('removeFromParent is no-op on root', () => {
    const node = new Node()
    expect(() => node.removeFromParent()).not.toThrow()
  })

  it('setParent moves node to new parent', () => {
    const p1 = new Node()
    const p2 = new Node()
    const child = new Node()
    p1.addChild(child)
    child.setParent(p2)
    expect(child.parent).toBe(p2)
    expect(p1.children.length).toBe(0)
    expect(p2.children).toContain(child)
  })

  it('setParent is no-op when parent is the same', () => {
    const parent = new Node()
    const child = new Node()
    parent.addChild(child)
    child.setParent(parent)
    expect(parent.children.length).toBe(1)
  })

  it('bringToFront moves node to end', () => {
    const parent = new Node()
    const a = new Node(), b = new Node(), c = new Node()
    parent.addChild(a)
    parent.addChild(b)
    parent.addChild(c)
    a.bringToFront()
    expect(parent.children).toEqual([b, c, a])
  })

  it('bringToFront is no-op when already last', () => {
    const parent = new Node()
    const a = new Node(), b = new Node()
    parent.addChild(a)
    parent.addChild(b)
    b.bringToFront()
    expect(parent.children).toEqual([a, b])
  })

  it('sendToBack moves node to start', () => {
    const parent = new Node()
    const a = new Node(), b = new Node(), c = new Node()
    parent.addChild(a)
    parent.addChild(b)
    parent.addChild(c)
    c.sendToBack()
    expect(parent.children).toEqual([c, a, b])
  })

  it('sendToBack is no-op when already first', () => {
    const parent = new Node()
    const a = new Node(), b = new Node()
    parent.addChild(a)
    parent.addChild(b)
    a.sendToBack()
    expect(parent.children).toEqual([a, b])
  })

  it('bringForward swaps with next sibling', () => {
    const parent = new Node()
    const a = new Node(), b = new Node(), c = new Node()
    parent.addChild(a)
    parent.addChild(b)
    parent.addChild(c)
    a.bringForward()
    expect(parent.children).toEqual([b, a, c])
  })

  it('bringForward is no-op when already last', () => {
    const parent = new Node()
    const a = new Node(), b = new Node()
    parent.addChild(a)
    parent.addChild(b)
    b.bringForward()
    expect(parent.children).toEqual([a, b])
  })

  it('sendBackward swaps with previous sibling', () => {
    const parent = new Node()
    const a = new Node(), b = new Node(), c = new Node()
    parent.addChild(a)
    parent.addChild(b)
    parent.addChild(c)
    c.sendBackward()
    expect(parent.children).toEqual([a, c, b])
  })

  it('sendBackward is no-op when already first', () => {
    const parent = new Node()
    const a = new Node(), b = new Node()
    parent.addChild(a)
    parent.addChild(b)
    a.sendBackward()
    expect(parent.children).toEqual([a, b])
  })

  it('visible defaults to true', () => {
    const node = new Node()
    expect(node.visible).toBe(true)
  })

  it('bringToFront/sendToBack are no-ops without parent', () => {
    const node = new Node()
    expect(() => node.bringToFront()).not.toThrow()
    expect(() => node.sendToBack()).not.toThrow()
  })
})
