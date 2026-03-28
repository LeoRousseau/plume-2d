import { Node } from '../core/Node'
import type { Scene } from '../core/Scene'
import type { View } from '../view/View'
import { TWO_PI } from '../math/constants'
import { ARenderable } from '../entity/Renderable'
import type { Polyline } from '../entity/Polyline'
import type { Circle } from '../entity/Circle'
import type { Rectangle } from '../entity/Rectangle'
import type { Ellipse } from '../entity/Ellipse'
import type { Arc } from '../entity/Arc'
import type { Path } from '../entity/Path'
import type { Text } from '../entity/Text'
import type { Raster } from '../entity/Raster'
import type { StrokeStyle } from '../entity/StrokeStyle'
import type { FillStyle } from '../entity/FillStyle'
import type { IRenderer } from './IRenderer'

export class SVGRenderer implements IRenderer {
  private width: number
  private height: number
  private elements: string[]
  private transformStack: string[]
  private defs: string[]
  private gradientIdCounter: number
  private _svg: string = ''

  constructor(width: number, height: number) {
    this.width = width
    this.height = height
    this.elements = []
    this.transformStack = []
    this.defs = []
    this.gradientIdCounter = 0
  }

  get svg(): string {
    return this._svg
  }

  render(scene: Scene, view: View): void {
    this.elements = []
    this.transformStack = []
    this.defs = []
    this.gradientIdCounter = 0

    const offsetX = this.width / 2 - view.center.x * view.zoom
    const offsetY = this.height / 2 - view.center.y * view.zoom
    this.transformStack.push(`translate(${offsetX},${offsetY}) scale(${view.zoom})`)

    this.renderNode(scene.root)

    this.transformStack.pop()

    const parts = [`<svg xmlns="http://www.w3.org/2000/svg" width="${this.width}" height="${this.height}">`]
    if (this.defs.length > 0) {
      parts.push('  <defs>', ...this.defs, '  </defs>')
    }
    parts.push(...this.elements, '</svg>')

    this._svg = parts.join('\n')
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
    if (sweep < 0) sweep += TWO_PI
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
    const fillAttr = this.resolveFillAttr(text.fill)
    const attrs: string[] = [
      `x="${text.position.x}"`,
      `y="${text.position.y}"`,
      `font-size="${text.fontSize}"`,
      `font-family="${text.fontFamily}"`,
      `text-anchor="${text.textAlign === 'center' ? 'middle' : text.textAlign === 'right' ? 'end' : 'start'}"`,
      `dominant-baseline="${text.textBaseline === 'middle' ? 'central' : text.textBaseline === 'top' ? 'hanging' : text.textBaseline === 'bottom' ? 'text-bottom' : 'auto'}"`,
      `fill="${fillAttr}"`,
    ]
    if (text.fill?.opacity !== undefined) attrs.push(`fill-opacity="${text.fill.opacity}"`)
    if (text.stroke.width > 0) {
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

  drawImage(image: Raster): void {
    const transform = this.transformStack.join(' ')
    const href = image.source.src

    this.elements.push(
      `  <g transform="${transform}">`,
      `    <image href="${href}" x="${image.origin.x}" y="${image.origin.y}" width="${image.width}" height="${image.height}" />`,
      `  </g>`,
    )
  }

  private resolveFillAttr(fill: FillStyle | null): string {
    if (!fill) return 'none'
    switch (fill.type) {
      case 'solid':
        return fill.color
      case 'linear-gradient': {
        const id = `g${this.gradientIdCounter++}`
        const stops = fill.stops.map(s => `    <stop offset="${s.offset}" stop-color="${s.color}" />`).join('\n')
        this.defs.push(
          `    <linearGradient id="${id}" x1="${fill.start.x}" y1="${fill.start.y}" x2="${fill.end.x}" y2="${fill.end.y}" gradientUnits="userSpaceOnUse">`,
          stops,
          `    </linearGradient>`,
        )
        return `url(#${id})`
      }
      case 'radial-gradient': {
        const id = `g${this.gradientIdCounter++}`
        const stops = fill.stops.map(s => `    <stop offset="${s.offset}" stop-color="${s.color}" />`).join('\n')
        this.defs.push(
          `    <radialGradient id="${id}" cx="${fill.center.x}" cy="${fill.center.y}" r="${fill.radius}" gradientUnits="userSpaceOnUse">`,
          stops,
          `    </radialGradient>`,
        )
        return `url(#${id})`
      }
      case 'pattern':
        return this.createSvgPattern(fill)
    }
  }

  private createSvgPattern(fill: import('../entity/FillStyle').PatternFill): string {
    const id = `p${this.gradientIdCounter++}`
    const spacing = fill.spacing ?? 10
    const size = fill.size ?? 1
    const angle = fill.angle ?? (fill.pattern === 'hatch' || fill.pattern === 'crosshatch' ? Math.PI / 4 : 0)

    const angleDeg = (angle * 180) / Math.PI
    const transform = angle !== 0 ? ` patternTransform="rotate(${angleDeg})"` : ''

    const children: string[] = []

    if (fill.background) {
      children.push(`      <rect width="${spacing}" height="${spacing}" fill="${fill.background}" />`)
    }

    switch (fill.pattern) {
      case 'hatch':
        children.push(
          `      <line x1="0" y1="${spacing / 2}" x2="${spacing}" y2="${spacing / 2}" stroke="${fill.color}" stroke-width="${size}" />`,
        )
        break
      case 'crosshatch':
        children.push(
          `      <line x1="0" y1="${spacing / 2}" x2="${spacing}" y2="${spacing / 2}" stroke="${fill.color}" stroke-width="${size}" />`,
          `      <line x1="${spacing / 2}" y1="0" x2="${spacing / 2}" y2="${spacing}" stroke="${fill.color}" stroke-width="${size}" />`,
        )
        break
      case 'dots':
        children.push(
          `      <circle cx="${spacing / 2}" cy="${spacing / 2}" r="${size}" fill="${fill.color}" />`,
        )
        break
      case 'grid':
        children.push(
          `      <line x1="0" y1="${spacing / 2}" x2="${spacing}" y2="${spacing / 2}" stroke="${fill.color}" stroke-width="${size}" />`,
          `      <line x1="${spacing / 2}" y1="0" x2="${spacing / 2}" y2="${spacing}" stroke="${fill.color}" stroke-width="${size}" />`,
        )
        break
    }

    this.defs.push(
      `    <pattern id="${id}" width="${spacing}" height="${spacing}" patternUnits="userSpaceOnUse"${transform}>`,
      ...children,
      `    </pattern>`,
    )
    return `url(#${id})`
  }

  private buildStyleAttrs(stroke: StrokeStyle, fill: FillStyle | null): string {
    const fillAttr = this.resolveFillAttr(fill)
    const attrs: string[] = [
      `stroke="${stroke.color}"`,
      `stroke-width="${stroke.width}"`,
      `fill="${fillAttr}"`,
    ]
    if (stroke.dashArray) attrs.push(`stroke-dasharray="${stroke.dashArray.join(',')}"`)
    if (stroke.dashOffset !== undefined) attrs.push(`stroke-dashoffset="${stroke.dashOffset}"`)
    if (stroke.lineCap) attrs.push(`stroke-linecap="${stroke.lineCap}"`)
    if (stroke.lineJoin) attrs.push(`stroke-linejoin="${stroke.lineJoin}"`)
    if (stroke.opacity !== undefined) attrs.push(`stroke-opacity="${stroke.opacity}"`)
    if (fill?.opacity !== undefined) attrs.push(`fill-opacity="${fill.opacity}"`)
    return attrs.join(' ')
  }

  private renderNode(node: Node): void {
    if (!node.visible) return
    const t = node.transform
    this.transformStack.push(
      `translate(${t.position.x},${t.position.y}) rotate(${(t.rotation * 180) / Math.PI}) scale(${t.scale.x},${t.scale.y})`,
    )

    if (node instanceof ARenderable) {
      node.draw(this)
    }

    for (const child of node.children) {
      this.renderNode(child)
    }

    this.transformStack.pop()
  }
}
