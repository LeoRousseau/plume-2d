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
    this.ctx.arc(circle.center.x, circle.center.y, circle.radius, 0, Math.PI * 2)
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
    this.ctx.ellipse(ellipse.center.x, ellipse.center.y, ellipse.rx, ellipse.ry, 0, 0, Math.PI * 2)
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
      this.ctx.fillStyle = text.fill.color
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

  private applyFill(fill: FillStyle | null): void {
    if (fill) {
      this.ctx.save()
      if (fill.opacity !== undefined) this.ctx.globalAlpha = fill.opacity
      this.ctx.fillStyle = fill.color
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
