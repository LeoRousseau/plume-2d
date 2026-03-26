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
}
