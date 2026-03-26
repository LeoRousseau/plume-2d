import { Node } from './Node'
import { Vector2 } from '../math/Vector2'
import { hitTest } from './HitTest'
import type { HitTestResult } from './HitTest'

/** Top-level container that holds the scene graph. */
export class Scene {
  /** Root node. All drawable shapes should be descendants of this node. */
  root: Node

  constructor() {
    this.root = new Node()
  }

  /**
   * Hit-tests the scene graph at the given world-space point.
   * Returns the top-most shape hit, or `null` if nothing was hit.
   * @param worldPoint - Point in world coordinates.
   * @param tolerance  - Extra pixel tolerance around stroked shapes (default 2).
   */
  pick(worldPoint: Vector2, tolerance: number = 2): HitTestResult | null {
    return hitTest(this.root, worldPoint, tolerance)
  }
}
