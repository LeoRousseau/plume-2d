import { Node } from '../core/Node'
import type { Scene } from '../core/Scene'
import type { View } from '../core/View'
import { Shape } from '../shapes/Shape'
import type { Polyline } from '../shapes/Polyline'
import type { IRenderer } from './IRenderer'

export class SVGRenderer implements IRenderer {
  private width: number
  private height: number
  private elements: string[]
  private transformStack: string[]
  private _svg: string = ''

  constructor(width: number, height: number) {
    this.width = width
    this.height = height
    this.elements = []
    this.transformStack = []
  }

  get svg(): string {
    return this._svg
  }

  render(scene: Scene, view: View): void {
    this.elements = []
    this.transformStack = []

    // View transform: center + zoom (same logic as Canvas2DRenderer)
    const offsetX = this.width / 2 - view.center.x * view.zoom
    const offsetY = this.height / 2 - view.center.y * view.zoom
    this.transformStack.push(`translate(${offsetX},${offsetY}) scale(${view.zoom})`)

    this.renderNode(scene.root)

    this.transformStack.pop()

    this._svg = [
      `<svg xmlns="http://www.w3.org/2000/svg" width="${this.width}" height="${this.height}">`,
      ...this.elements,
      '</svg>',
    ].join('\n')
  }

  drawPolyline(polyline: Polyline): void {
    if (polyline.points.length < 2) return

    const pts = polyline.points.map((p) => `${p.x},${p.y}`).join(' ')
    const tag = polyline.isClosed ? 'polygon' : 'polyline'
    const transform = this.transformStack.join(' ')

    const attrs: string[] = [
      `points="${pts}"`,
      `stroke="${polyline.strokeColor}"`,
      `stroke-width="${polyline.strokeWidth}"`,
      `fill="${polyline.fillColor}"`,
    ]

    this.elements.push(
      `  <g transform="${transform}">`,
      `    <${tag} ${attrs.join(' ')} />`,
      `  </g>`,
    )
  }

  private renderNode(node: Node): void {
    const t = node.transform
    this.transformStack.push(
      `translate(${t.position.x},${t.position.y}) rotate(${(t.rotation * 180) / Math.PI}) scale(${t.scale.x},${t.scale.y})`,
    )

    if (node instanceof Shape) {
      node.draw(this)
    }

    for (const child of node.children) {
      this.renderNode(child)
    }

    this.transformStack.pop()
  }
}
