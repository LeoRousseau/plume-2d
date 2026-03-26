import type { Vector2 } from '../math/Vector2'

/** Discriminated union representing one segment of a {@link Path}. */
export type PathSegment =
  | { type: 'moveTo'; point: Vector2 }
  | { type: 'lineTo'; point: Vector2 }
  | { type: 'quadraticTo'; control: Vector2; point: Vector2 }
  | { type: 'cubicTo'; control1: Vector2; control2: Vector2; point: Vector2 }
  | { type: 'close' }
