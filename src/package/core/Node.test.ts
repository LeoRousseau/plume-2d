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
})
