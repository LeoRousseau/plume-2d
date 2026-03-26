import type { Scene } from '../core/Scene'
import type { View } from './View'
import type { Polyline } from '../core/Polyline'
import type { Circle } from '../core/Circle'
import type { Rectangle } from '../core/Rectangle'
import type { Ellipse } from '../core/Ellipse'
import type { Arc } from '../core/Arc'
import type { Path } from '../core/Path'

export interface IRenderer {
  render(scene: Scene, view: View): void
  drawPolyline(polyline: Polyline): void
  drawCircle(circle: Circle): void
  drawRectangle(rect: Rectangle): void
  drawEllipse(ellipse: Ellipse): void
  drawArc(arc: Arc): void
  drawPath(path: Path): void
}
