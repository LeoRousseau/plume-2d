/** Describes how the outline of a shape is rendered. */
export interface StrokeStyle {
  /** CSS color string (e.g. `'#ff0000'`, `'rgba(0,0,0,0.5)'`). */
  color: string
  /** Line width in pixels. */
  width: number
  /** Dash pattern — array of `[dash, gap, …]` lengths. */
  dashArray?: number[]
  /** Offset into the dash pattern. */
  dashOffset?: number
  /** Line cap style: `'butt'`, `'round'`, or `'square'`. */
  lineCap?: CanvasLineCap
  /** Line join style: `'miter'`, `'round'`, or `'bevel'`. */
  lineJoin?: CanvasLineJoin
  /** Stroke opacity (0–1). */
  opacity?: number
}

/** Returns a default white 1px stroke. */
export function defaultStroke(): StrokeStyle {
  return { color: '#ffffff', width: 1 }
}
