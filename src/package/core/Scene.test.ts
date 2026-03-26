import { describe, it, expect } from 'vitest'
import { Scene } from './Scene'

describe('Scene', () => {
  it('creates with a root node', () => {
    const scene = new Scene()
    expect(scene.root).toBeDefined()
  })

  it('root node has no parent', () => {
    const scene = new Scene()
    expect(scene.root.parent).toBeNull()
  })

  it('root node starts with empty children', () => {
    const scene = new Scene()
    expect(scene.root.children).toEqual([])
  })
})
