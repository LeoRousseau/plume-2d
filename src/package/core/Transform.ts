import { Vector2 } from '../math/Vector2'
import { Matrix } from '../math/Matrix'
import type { Node } from './Node'

export class Transform {
  position: Vector2
  rotation: number
  scale: Vector2
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

  get localMatrix(): Matrix {
    return Matrix.compose(this.position, this.rotation, this.scale)
  }

  get worldMatrix(): Matrix {
    const local = this.localMatrix
    if (this.owner?.parent) {
      return this.owner.parent.transform.worldMatrix.multiply(local)
    }
    return local
  }
}
