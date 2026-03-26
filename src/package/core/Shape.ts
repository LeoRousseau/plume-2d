import { Node } from '../core/Node'
import type { IRenderer } from '../rendering/IRenderer'
import type { BoundingBox } from '../math/BoundingBox'
import type { StrokeStyle } from './StrokeStyle'
import type { FillStyle } from './FillStyle'
import { defaultStroke } from './StrokeStyle'
import { defaultFill } from './FillStyle'

export abstract class Shape extends Node {
  stroke: StrokeStyle
  fill: FillStyle

  constructor() {
    super()
    this.stroke = defaultStroke()
    this.fill = defaultFill()
  }

  abstract getBoundingBox(): BoundingBox
  abstract draw(renderer: IRenderer): void
}
