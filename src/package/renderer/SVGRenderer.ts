import { Node } from '../core/Node'
import type { Scene } from '../core/Scene'
import type { View } from '../rendering/View'
import { AShape } from '../entity/Shape'
import type { Polyline } from '../entity/Polyline'
import type { Circle } from '../entity/Circle'
import type { Rectangle } from '../entity/Rectangle'
import type { Ellipse } from '../entity/Ellipse'
import type { Arc } from '../entity/Arc'
import type { Path } from '../entity/Path'
import type { Text } from '../entity/Text'
import type { StrokeStyle } from '../entity/StrokeStyle'
import type { FillStyle } from '../entity/FillStyle'
import type { IRenderer } from '../rendering/IRenderer'

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
    const style = this.buildStyleAttrs(polyline.stroke, polyline.fill)

    this.elements.push(
      `  <g transform="${transform}">`,
      `    <${tag} points="${pts}" ${style} />`,
      `  </g>`,
    )
  }

  drawCircle(circle: Circle): void {
    const transform = this.transformStack.join(' ')
    const style = this.buildStyleAttrs(circle.stroke, circle.fill)

    this.elements.push(
      `  <g transform="${transform}">`,
      `    <circle cx="${circle.center.x}" cy="${circle.center.y}" r="${circle.radius}" ${style} />`,
      `  </g>`,
    )
  }

  drawRectangle(rect: Rectangle): void {
    const transform = this.transformStack.join(' ')
    const style = this.buildStyleAttrs(rect.stroke, rect.fill)

    this.elements.push(
      `  <g transform="${transform}">`,
      `    <rect x="${rect.origin.x}" y="${rect.origin.y}" width="${rect.width}" height="${rect.height}" ${style} />`,
      `  </g>`,
    )
  }

  drawEllipse(ellipse: Ellipse): void {
    const transform = this.transformStack.join(' ')
    const style = this.buildStyleAttrs(ellipse.stroke, ellipse.fill)

    this.elements.push(
      `  <g transform="${transform}">`,
      `    <ellipse cx="${ellipse.center.x}" cy="${ellipse.center.y}" rx="${ellipse.rx}" ry="${ellipse.ry}" ${style} />`,
      `  </g>`,
    )
  }

  drawArc(arc: Arc): void {
    const transform = this.transformStack.join(' ')
    const style = this.buildStyleAttrs(arc.stroke, arc.fill)
    const startX = arc.center.x + arc.radius * Math.cos(arc.startAngle)
    const startY = arc.center.y + arc.radius * Math.sin(arc.startAngle)
    const endX = arc.center.x + arc.radius * Math.cos(arc.endAngle)
    const endY = arc.center.y + arc.radius * Math.sin(arc.endAngle)
    let sweep = arc.endAngle - arc.startAngle
    if (sweep < 0) sweep += Math.PI * 2
    const largeArc = sweep > Math.PI ? 1 : 0

    this.elements.push(
      `  <g transform="${transform}">`,
      `    <path d="M ${startX} ${startY} A ${arc.radius} ${arc.radius} 0 ${largeArc} 1 ${endX} ${endY}" ${style} />`,
      `  </g>`,
    )
  }

  drawPath(path: Path): void {
    const transform = this.transformStack.join(' ')
    const style = this.buildStyleAttrs(path.stroke, path.fill)
    let d = ''
    for (const seg of path.segments) {
      switch (seg.type) {
        case 'moveTo':
          d += `M ${seg.point.x} ${seg.point.y} `
          break
        case 'lineTo':
          d += `L ${seg.point.x} ${seg.point.y} `
          break
        case 'quadraticTo':
          d += `Q ${seg.control.x} ${seg.control.y} ${seg.point.x} ${seg.point.y} `
          break
        case 'cubicTo':
          d += `C ${seg.control1.x} ${seg.control1.y} ${seg.control2.x} ${seg.control2.y} ${seg.point.x} ${seg.point.y} `
          break
        case 'close':
          d += 'Z '
          break
      }
    }

    this.elements.push(
      `  <g transform="${transform}">`,
      `    <path d="${d.trim()}" ${style} />`,
      `  </g>`,
    )
  }

  drawText(text: Text): void {
    const transform = this.transformStack.join(' ')
    const attrs: string[] = [
      `x="${text.position.x}"`,
      `y="${text.position.y}"`,
      `font-size="${text.fontSize}"`,
      `font-family="${text.fontFamily}"`,
      `text-anchor="${text.textAlign === 'center' ? 'middle' : text.textAlign === 'right' ? 'end' : 'start'}"`,
      `dominant-baseline="${text.textBaseline === 'middle' ? 'central' : text.textBaseline === 'top' ? 'hanging' : text.textBaseline === 'bottom' ? 'text-bottom' : 'auto'}"`,
      `fill="${text.fill.color}"`,
    ]
    if (text.fill.opacity !== undefined) attrs.push(`fill-opacity="${text.fill.opacity}"`)
    if (text.stroke.width > 0 && text.stroke.color !== 'transparent') {
      attrs.push(`stroke="${text.stroke.color}"`, `stroke-width="${text.stroke.width}"`)
      if (text.stroke.opacity !== undefined) attrs.push(`stroke-opacity="${text.stroke.opacity}"`)
    }
    const escaped = text.content
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;')

    this.elements.push(
      `  <g transform="${transform}">`,
      `    <text ${attrs.join(' ')}>${escaped}</text>`,
      `  </g>`,
    )
  }

  private buildStyleAttrs(stroke: StrokeStyle, fill: FillStyle): string {
    const attrs: string[] = [
      `stroke="${stroke.color}"`,
      `stroke-width="${stroke.width}"`,
      `fill="${fill.color}"`,
    ]
    if (stroke.dashArray) attrs.push(`stroke-dasharray="${stroke.dashArray.join(',')}"`)
    if (stroke.dashOffset !== undefined) attrs.push(`stroke-dashoffset="${stroke.dashOffset}"`)
    if (stroke.lineCap) attrs.push(`stroke-linecap="${stroke.lineCap}"`)
    if (stroke.lineJoin) attrs.push(`stroke-linejoin="${stroke.lineJoin}"`)
    if (stroke.opacity !== undefined) attrs.push(`stroke-opacity="${stroke.opacity}"`)
    if (fill.opacity !== undefined) attrs.push(`fill-opacity="${fill.opacity}"`)
    return attrs.join(' ')
  }

  private renderNode(node: Node): void {
    const t = node.transform
    this.transformStack.push(
      `translate(${t.position.x},${t.position.y}) rotate(${(t.rotation * 180) / Math.PI}) scale(${t.scale.x},${t.scale.y})`,
    )

    if (node instanceof AShape) {
      node.draw(this)
    }

    for (const child of node.children) {
      this.renderNode(child)
    }

    this.transformStack.pop()
  }
}
