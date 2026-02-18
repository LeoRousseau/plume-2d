import type { Scene } from '../core/Scene'
import type { View } from '../core/View'
import type { Polyline } from '../shapes/Polyline'

export interface IRenderer {
  render(scene: Scene, view: View): void
  drawPolyline(polyline: Polyline): void
}
