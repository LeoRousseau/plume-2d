import { Node } from '../core/Node'
import type { Scene } from '../core/Scene'
import type { View } from '../view/View'
import { TWO_PI } from '../math/constants'
import { AShape } from '../entity/Shape'
import type { Polyline } from '../entity/Polyline'
import type { Circle } from '../entity/Circle'
import type { Rectangle } from '../entity/Rectangle'
import type { Ellipse } from '../entity/Ellipse'
import type { Arc } from '../entity/Arc'
import type { Path } from '../entity/Path'
import type { Text } from '../entity/Text'
import type { StrokeStyle } from '../entity/StrokeStyle'
import type { FillStyle, PatternFill } from '../entity/FillStyle'
import type { IRenderer } from './IRenderer'

export class Canvas2DRenderer implements IRenderer {
  private ctx: CanvasRenderingContext2D

  constructor(private canvas: HTMLCanvasElement) {
    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('Could not get 2D context')
    this.ctx = ctx
  }

  render(scene: Scene, view: View): void {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)

    this.ctx.save()

    // Apply view transform: center + zoom
    const offsetX = this.canvas.width / 2 - view.center.x * view.zoom
    const offsetY = this.canvas.height / 2 - view.center.y * view.zoom
    this.ctx.translate(offsetX, offsetY)
    this.ctx.scale(view.zoom, view.zoom)

    this.renderNode(scene.root)

    this.ctx.restore()
  }

  drawPolyline(polyline: Polyline): void {
    if (polyline.points.length < 2) return

    this.ctx.beginPath()
    this.ctx.moveTo(polyline.points[0].x, polyline.points[0].y)

    for (let i = 1; i < polyline.points.length; i++) {
      this.ctx.lineTo(polyline.points[i].x, polyline.points[i].y)
    }

    if (polyline.isClosed) {
      this.ctx.closePath()
    }

    this.applyFill(polyline.fill)
    this.applyStroke(polyline.stroke)
  }

  drawCircle(circle: Circle): void {
    this.ctx.beginPath()
    this.ctx.arc(circle.center.x, circle.center.y, circle.radius, 0, TWO_PI)
    this.applyFill(circle.fill)
    this.applyStroke(circle.stroke)
  }

  drawRectangle(rect: Rectangle): void {
    this.ctx.beginPath()
    this.ctx.rect(rect.origin.x, rect.origin.y, rect.width, rect.height)
    this.applyFill(rect.fill)
    this.applyStroke(rect.stroke)
  }

  drawEllipse(ellipse: Ellipse): void {
    this.ctx.beginPath()
    this.ctx.ellipse(ellipse.center.x, ellipse.center.y, ellipse.rx, ellipse.ry, 0, 0, TWO_PI)
    this.applyFill(ellipse.fill)
    this.applyStroke(ellipse.stroke)
  }

  drawArc(arc: Arc): void {
    this.ctx.beginPath()
    this.ctx.arc(arc.center.x, arc.center.y, arc.radius, arc.startAngle, arc.endAngle)
    this.applyStroke(arc.stroke)
  }

  drawPath(path: Path): void {
    this.ctx.beginPath()
    for (const seg of path.segments) {
      switch (seg.type) {
        case 'moveTo':
          this.ctx.moveTo(seg.point.x, seg.point.y)
          break
        case 'lineTo':
          this.ctx.lineTo(seg.point.x, seg.point.y)
          break
        case 'quadraticTo':
          this.ctx.quadraticCurveTo(seg.control.x, seg.control.y, seg.point.x, seg.point.y)
          break
        case 'cubicTo':
          this.ctx.bezierCurveTo(seg.control1.x, seg.control1.y, seg.control2.x, seg.control2.y, seg.point.x, seg.point.y)
          break
        case 'close':
          this.ctx.closePath()
          break
      }
    }
    this.applyFill(path.fill)
    this.applyStroke(path.stroke)
  }

  drawText(text: Text): void {
    this.ctx.font = text.font
    this.ctx.textAlign = text.textAlign
    this.ctx.textBaseline = text.textBaseline

    if (text.fill) {
      this.ctx.save()
      if (text.fill.opacity !== undefined) this.ctx.globalAlpha = text.fill.opacity
      this.ctx.fillStyle = this.resolveFillStyle(text.fill)
      this.ctx.fillText(text.content, text.position.x, text.position.y)
      this.ctx.restore()
    }

    if (text.stroke.width > 0) {
      this.ctx.save()
      if (text.stroke.opacity !== undefined) this.ctx.globalAlpha = text.stroke.opacity
      this.ctx.strokeStyle = text.stroke.color
      this.ctx.lineWidth = text.stroke.width
      this.ctx.strokeText(text.content, text.position.x, text.position.y)
      this.ctx.restore()
    }
  }

  private resolveFillStyle(fill: FillStyle): string | CanvasGradient | CanvasPattern {
    switch (fill.type) {
      case 'solid':
        return fill.color
      case 'linear-gradient': {
        const g = this.ctx.createLinearGradient(fill.start.x, fill.start.y, fill.end.x, fill.end.y)
        for (const s of fill.stops) g.addColorStop(s.offset, s.color)
        return g
      }
      case 'radial-gradient': {
        const g = this.ctx.createRadialGradient(fill.center.x, fill.center.y, 0, fill.center.x, fill.center.y, fill.radius)
        for (const s of fill.stops) g.addColorStop(s.offset, s.color)
        return g
      }
      case 'pattern':
        return this.createPatternFill(fill)
    }
  }

  private createPatternFill(fill: PatternFill): CanvasPattern {
    const spacing = fill.spacing ?? 10
    const size = fill.size ?? 1
    const angle = fill.angle ?? (fill.pattern === 'hatch' || fill.pattern === 'crosshatch' ? Math.PI / 4 : 0)

    // Render the tile at high resolution to stay sharp when zoomed
    const dpr = window.devicePixelRatio || 1
    const ctxTransform = this.ctx.getTransform()
    const effectiveScale = Math.sqrt(ctxTransform.a * ctxTransform.a + ctxTransform.b * ctxTransform.b)
    const res = Math.max(1, effectiveScale * dpr)
    const s = Math.ceil(spacing * res)
    const ratio = s / spacing  // actual pixel-to-user-unit ratio
    const lw = size * ratio
    const dotR = size * ratio

    const offscreen = document.createElement('canvas')
    offscreen.width = s
    offscreen.height = s
    const oc = offscreen.getContext('2d')!

    if (fill.background) {
      oc.fillStyle = fill.background
      oc.fillRect(0, 0, s, s)
    }

    oc.strokeStyle = fill.color
    oc.fillStyle = fill.color
    oc.lineWidth = lw
    oc.lineCap = 'square'

    switch (fill.pattern) {
      case 'hatch':
        oc.beginPath()
        oc.moveTo(0, s / 2)
        oc.lineTo(s, s / 2)
        oc.stroke()
        break
      case 'crosshatch':
        oc.beginPath()
        oc.moveTo(0, s / 2)
        oc.lineTo(s, s / 2)
        oc.moveTo(s / 2, 0)
        oc.lineTo(s / 2, s)
        oc.stroke()
        break
      case 'dots':
        oc.beginPath()
        oc.arc(s / 2, s / 2, dotR, 0, Math.PI * 2)
        oc.fill()
        break
      case 'grid':
        oc.beginPath()
        oc.moveTo(0, s / 2)
        oc.lineTo(s, s / 2)
        oc.moveTo(s / 2, 0)
        oc.lineTo(s / 2, s)
        oc.stroke()
        break
    }

    // Scale tile back to exactly `spacing` user-units
    const inv = spacing / s
    const m = new DOMMatrix().scaleSelf(inv, inv)
    if (angle !== 0) {
      m.rotateSelf((angle * 180) / Math.PI)
    }

    const pattern = this.ctx.createPattern(offscreen, 'repeat')!
    pattern.setTransform(m)
    return pattern
  }

  private applyFill(fill: FillStyle | null): void {
    if (fill) {
      this.ctx.save()
      if (fill.opacity !== undefined) this.ctx.globalAlpha = fill.opacity
      this.ctx.fillStyle = this.resolveFillStyle(fill)
      this.ctx.fill()
      this.ctx.restore()
    }
  }

  private applyStroke(stroke: StrokeStyle): void {
    if (stroke.width > 0) {
      this.ctx.save()
      if (stroke.opacity !== undefined) this.ctx.globalAlpha = stroke.opacity
      this.ctx.strokeStyle = stroke.color
      this.ctx.lineWidth = stroke.width
      if (stroke.dashArray) this.ctx.setLineDash(stroke.dashArray)
      if (stroke.dashOffset !== undefined) this.ctx.lineDashOffset = stroke.dashOffset
      if (stroke.lineCap) this.ctx.lineCap = stroke.lineCap
      if (stroke.lineJoin) this.ctx.lineJoin = stroke.lineJoin
      this.ctx.stroke()
      this.ctx.restore()
    }
  }

  private renderNode(node: Node): void {
    this.ctx.save()
    this.applyTransform(node)

    if (node instanceof AShape) {
      node.draw(this)
    }

    for (const child of node.children) {
      this.renderNode(child)
    }

    this.ctx.restore()
  }

  private applyTransform(node: Node): void {
    const t = node.transform
    this.ctx.translate(t.position.x, t.position.y)
    this.ctx.rotate(t.rotation)
    this.ctx.scale(t.scale.x, t.scale.y)
  }
}
