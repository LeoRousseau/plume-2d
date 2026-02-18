import { Transform } from './Transform'

export class Node {
  private static nextId = 0

  id: number
  transform: Transform
  children: Node[]
  parent: Node | null = null

  constructor() {
    this.id = Node.nextId++
    this.transform = new Transform()
    this.transform.owner = this
    this.children = []
  }

  addChild(child: Node): void {
    child.parent = this
    this.children.push(child)
  }

  removeChild(child: Node): void {
    const index = this.children.indexOf(child)
    if (index !== -1) {
      child.parent = null
      this.children.splice(index, 1)
    }
  }
}
