/** Describes how the interior of a shape is filled. */
export interface FillStyle {
  /** CSS color string. Use `'transparent'` for no fill. */
  color: string
  /** Fill opacity (0–1). */
  opacity?: number
}

/** Returns a default transparent (no fill) style. */
export function defaultFill(): FillStyle {
  return { color: 'transparent' }
}
