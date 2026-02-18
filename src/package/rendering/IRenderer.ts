import type { Scene } from '../core/Scene'
import type { View } from './View'
import type { Polyline } from '../core/Polyline'

export interface IRenderer {
  render(scene: Scene, view: View): void
  drawPolyline(polyline: Polyline): void
}
