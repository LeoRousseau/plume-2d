import { Node } from '../core/Node'
import type { Scene } from '../core/Scene'
import type { View } from '../rendering/View'
import { Shape } from '../core/Shape'
import type { Polyline } from '../core/Polyline'
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

    if (polyline.fillColor !== 'transparent') {
      this.ctx.fillStyle = polyline.fillColor
      this.ctx.fill()
    }

    if (polyline.strokeWidth > 0) {
      this.ctx.strokeStyle = polyline.strokeColor
      this.ctx.lineWidth = polyline.strokeWidth
      this.ctx.stroke()
    }
  }

  private renderNode(node: Node): void {
    this.ctx.save()
    this.applyTransform(node)

    if (node instanceof Shape) {
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
