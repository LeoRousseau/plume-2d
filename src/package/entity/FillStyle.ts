import type { Vector2 } from '../math/Vector2'

/** Solid color fill. */
export interface SolidFill {
  type: 'solid'
  /** CSS color string (e.g. `'#ff0000'`, `'rgba(0,0,0,0.5)'`). */
  color: string
  /** Fill opacity (0–1). */
  opacity?: number
}

/** A color stop within a gradient. */
export interface GradientStop {
  /** Position along the gradient (0–1). */
  offset: number
  /** CSS color string. */
  color: string
}

/** Linear gradient fill between two points. */
export interface LinearGradientFill {
  type: 'linear-gradient'
  /** Start point in local shape coordinates. */
  start: Vector2
  /** End point in local shape coordinates. */
  end: Vector2
  /** Color stops along the gradient. */
  stops: GradientStop[]
  /** Fill opacity (0–1). */
  opacity?: number
}

/** Radial gradient fill from center outward. */
export interface RadialGradientFill {
  type: 'radial-gradient'
  /** Center point in local shape coordinates. */
  center: Vector2
  /** Outer radius of the gradient. */
  radius: number
  /** Color stops along the gradient. */
  stops: GradientStop[]
  /** Fill opacity (0–1). */
  opacity?: number
}

/** Describes how the interior of a shape is filled. */
export type FillStyle = SolidFill | LinearGradientFill | RadialGradientFill
