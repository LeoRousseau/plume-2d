import { Vector2 } from '../math/Vector2'
import { Matrix } from '../math/Matrix'
import type { Node } from './Node'

/** Describes a 2D transform: position, rotation (radians), and scale. */
export class Transform {
  position: Vector2
  /** Rotation in radians. */
  rotation: number
  scale: Vector2
  /** @internal Back-reference to the owning Node. */
  owner: Node | null = null

  constructor(
    position = new Vector2(),
    rotation = 0,
    scale = new Vector2(1, 1),
  ) {
    this.position = position
    this.rotation = rotation
    this.scale = scale
  }

  /** Composed local matrix: Translation * Rotation * Scale. */
  get localMatrix(): Matrix {
    return Matrix.compose(this.position, this.rotation, this.scale)
  }

  /** World matrix, taking parent transforms into account. */
  get worldMatrix(): Matrix {
    const local = this.localMatrix
    if (this.owner?.parent) {
      return this.owner.parent.transform.worldMatrix.multiply(local)
    }
    return local
  }
}
