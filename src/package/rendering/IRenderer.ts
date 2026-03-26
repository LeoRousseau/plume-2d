import type { Scene } from '../core/Scene'
import type { View } from './View'
import type { AShape } from '../entity/Shape'
import type { Polyline } from '../entity/Polyline'
import type { Circle } from '../entity/Circle'
import type { Rectangle } from '../entity/Rectangle'
import type { Ellipse } from '../entity/Ellipse'
import type { Arc } from '../entity/Arc'
import type { Path } from '../entity/Path'
import type { Text } from '../entity/Text'

/** Interface that all rendering backends must implement. */
export interface IRenderer {
  /** Renders the entire scene from the given viewpoint. */
  render(scene: Scene, view: View): void

  // --- Built-in shape renderers ---
  drawPolyline(polyline: Polyline): void
  drawCircle(circle: Circle): void
  drawRectangle(rect: Rectangle): void
  drawEllipse(ellipse: Ellipse): void
  drawArc(arc: Arc): void
  drawPath(path: Path): void
  drawText(text: Text): void

  /**
   * Fallback renderer for custom shapes not covered by the specific `draw*` methods.
   * Override this to support custom AShape subclasses without modifying IRenderer.
   * Default implementations may ignore unknown shapes.
   */
  drawShape?(shape: AShape): void
}
