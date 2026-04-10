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

/** Procedural geometric pattern fill. */
export interface PatternFill {
  type: 'pattern'
  /** Pattern type. */
  pattern: 'hatch' | 'crosshatch' | 'dots' | 'grid'
  /** Pattern stroke/dot color (CSS color string). */
  color: string
  /** Background color, or `null` for transparent background. */
  background: string | null
  /** Spacing between pattern elements in pixels (default 10). */
  spacing?: number
  /** Rotation angle in radians (default `Math.PI / 4` for hatch/crosshatch, `0` otherwise). */
  angle?: number
  /** Line width or dot radius in pixels (default 1). */
  size?: number
  /** Fill opacity (0–1). */
  opacity?: number
}

/** Describes how the interior of a shape is filled. */
export type FillStyle = SolidFill | LinearGradientFill | RadialGradientFill | PatternFill
