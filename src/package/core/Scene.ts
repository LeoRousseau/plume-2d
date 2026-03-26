import { Node } from './Node'

/** Top-level container that holds the scene graph. */
export class Scene {
  /** Root node. All drawable shapes should be descendants of this node. */
  root: Node

  constructor() {
    this.root = new Node()
  }
}
