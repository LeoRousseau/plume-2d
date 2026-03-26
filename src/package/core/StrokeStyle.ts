export interface StrokeStyle {
  color: string
  width: number
  dashArray?: number[]
  dashOffset?: number
  lineCap?: CanvasLineCap
  lineJoin?: CanvasLineJoin
  opacity?: number
}

export function defaultStroke(): StrokeStyle {
  return { color: '#ffffff', width: 1 }
}
