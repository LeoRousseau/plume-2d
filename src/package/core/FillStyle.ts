export interface FillStyle {
  color: string
  opacity?: number
}

export function defaultFill(): FillStyle {
  return { color: 'transparent' }
}
