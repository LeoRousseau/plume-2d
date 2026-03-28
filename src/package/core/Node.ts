import { Transform } from './Transform'

/** Base scene-graph node. Supports parent/child hierarchy and transforms. */
export class Node {
  private static nextId = 0

  /** Unique auto-incremented identifier. */
  id: number
  /** Local transform (position, rotation, scale). */
  transform: Transform
  /** Ordered list of child nodes. */
  children: Node[]
  /** Parent node, or `null` if this is a root. */
  parent: Node | null = null

  constructor() {
    this.id = Node.nextId++
    this.transform = new Transform()
    this.transform.owner = this
    this.children = []
  }

  /** Adds a child node and sets its parent to `this`. */
  addChild(child: Node): void {
    child.parent = this
    this.children.push(child)
  }

  /** Removes a child node and clears its parent reference. */
  removeChild(child: Node): void {
    const index = this.children.indexOf(child)
    if (index !== -1) {
      child.parent = null
      this.children.splice(index, 1)
    }
  }

  /** Detaches this node from its parent. No-op if already a root. */
  removeFromParent(): void {
    if (this.parent) {
      this.parent.removeChild(this)
    }
  }

  /** Moves this node to a new parent. Detaches from the current parent first. */
  setParent(newParent: Node): void {
    if (this.parent === newParent) return
    this.removeFromParent()
    newParent.addChild(this)
  }

  /** Moves this node to the end of its parent's children (drawn last = on top). */
  bringToFront(): void {
    if (!this.parent) return
    const siblings = this.parent.children
    const index = siblings.indexOf(this)
    if (index !== -1 && index !== siblings.length - 1) {
      siblings.splice(index, 1)
      siblings.push(this)
    }
  }

  /** Moves this node to the start of its parent's children (drawn first = behind). */
  sendToBack(): void {
    if (!this.parent) return
    const siblings = this.parent.children
    const index = siblings.indexOf(this)
    if (index > 0) {
      siblings.splice(index, 1)
      siblings.unshift(this)
    }
  }

  /** Moves this node one position forward in its parent's children (one step closer to front). */
  bringForward(): void {
    if (!this.parent) return
    const siblings = this.parent.children
    const index = siblings.indexOf(this)
    if (index !== -1 && index < siblings.length - 1) {
      siblings[index] = siblings[index + 1]
      siblings[index + 1] = this
    }
  }

  /** Moves this node one position backward in its parent's children (one step closer to back). */
  sendBackward(): void {
    if (!this.parent) return
    const siblings = this.parent.children
    const index = siblings.indexOf(this)
    if (index > 0) {
      siblings[index] = siblings[index - 1]
      siblings[index - 1] = this
    }
  }
}
