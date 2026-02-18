import { Node } from '../core/Node'
import type { IRenderer } from '../rendering/IRenderer'

export abstract class Shape extends Node {
  fillColor: string
  strokeColor: string
  strokeWidth: number

  constructor() {
    super()
    this.fillColor = 'transparent'
    this.strokeColor = '#ffffff'
    this.strokeWidth = 1
  }

  abstract draw(renderer: IRenderer): void
}
