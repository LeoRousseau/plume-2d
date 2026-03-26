import type { Scene } from '../core/Scene'
import type { View } from './View'
import type { Polyline } from '../core/Polyline'
import type { Circle } from '../core/Circle'
import type { Rectangle } from '../core/Rectangle'
import type { Ellipse } from '../core/Ellipse'
import type { Arc } from '../core/Arc'
import type { Path } from '../core/Path'
import type { Text } from '../core/Text'

/** Interface that all rendering backends must implement. */
export interface IRenderer {
  /** Renders the entire scene from the given viewpoint. */
  render(scene: Scene, view: View): void
  drawPolyline(polyline: Polyline): void
  drawCircle(circle: Circle): void
  drawRectangle(rect: Rectangle): void
  drawEllipse(ellipse: Ellipse): void
  drawArc(arc: Arc): void
  drawPath(path: Path): void
  drawText(text: Text): void
}
