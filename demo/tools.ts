import {
  Vector2, Scene, Circle, Rectangle, Ellipse, Polyline, Path, Text, BoundingBox,
} from '@plume/index'
import type { StrokeStyle, FillStyle } from '@plume/index'
import { ARenderable, AShape } from '@plume/index'

export type ToolType = 'select' | 'circle' | 'rectangle' | 'ellipse' | 'polyline' | 'path' | 'text'

export interface ToolState {
  activeTool: ToolType
  stroke: StrokeStyle
  fill: FillStyle | null
}

export function createToolState(): ToolState {
  return {
    activeTool: 'select',
    stroke: { color: '#e94560', width: 2 },
    fill: { type: 'solid', color: 'rgba(255,255,255,0.1)' },
  }
}

export interface DrawContext {
  scene: Scene
  toolState: ToolState
  render: () => void
}

// ---------------------------------------------------------------------------
// Fill resolution: map normalized gradient coords to shape bounding box
// ---------------------------------------------------------------------------

function resolveFill(fill: FillStyle | null, shape: AShape): FillStyle | null {
  if (!fill) return null
  if (fill.type === 'linear-gradient') {
    const bb = shape.getBoundingBox()
    return {
      ...fill,
      start: new Vector2(bb.min.x + fill.start.x * bb.width, bb.min.y + fill.start.y * bb.height),
      end: new Vector2(bb.min.x + fill.end.x * bb.width, bb.min.y + fill.end.y * bb.height),
    }
  }
  if (fill.type === 'radial-gradient') {
    const bb = shape.getBoundingBox()
    const cx = bb.min.x + fill.center.x * bb.width
    const cy = bb.min.y + fill.center.y * bb.height
    const r = fill.radius * Math.max(bb.width, bb.height) / 2
    return {
      ...fill,
      center: new Vector2(cx, cy),
      radius: r,
    }
  }
  return { ...fill }
}

// ---------------------------------------------------------------------------
// Part 2: Drag-to-create handlers
// ---------------------------------------------------------------------------

/** Shape being drawn — not yet committed to the scene */
let preview: ARenderable | null = null
let dragStart: Vector2 | null = null

export function handleDrawStart(pos: Vector2, ctx: DrawContext): void {
  const { activeTool } = ctx.toolState
  if (activeTool === 'select' || activeTool === 'polyline' || activeTool === 'path' || activeTool === 'text') return
  dragStart = pos
  preview = null
}

export function handleDrawMove(pos: Vector2, ctx: DrawContext): void {
  if (!dragStart) return
  const { activeTool, stroke, fill } = ctx.toolState

  // Remove previous preview
  if (preview) ctx.scene.root.removeChild(preview)

  if (activeTool === 'rectangle') {
    const min = new Vector2(Math.min(dragStart.x, pos.x), Math.min(dragStart.y, pos.y))
    const w = Math.abs(pos.x - dragStart.x)
    const h = Math.abs(pos.y - dragStart.y)
    if (w < 2 && h < 2) return
    const r = new Rectangle(min, w, h)
    r.stroke = { ...stroke }
    r.fill = resolveFill(fill, r)
    preview = r
  } else if (activeTool === 'circle') {
    const dx = pos.x - dragStart.x
    const dy = pos.y - dragStart.y
    const radius = Math.sqrt(dx * dx + dy * dy)
    if (radius < 2) return
    const c = new Circle(dragStart, radius)
    c.stroke = { ...stroke }
    c.fill = resolveFill(fill, c)
    preview = c
  } else if (activeTool === 'ellipse') {
    const rx = Math.abs(pos.x - dragStart.x)
    const ry = Math.abs(pos.y - dragStart.y)
    if (rx < 2 && ry < 2) return
    const center = new Vector2(
      (dragStart.x + pos.x) / 2,
      (dragStart.y + pos.y) / 2,
    )
    const e = new Ellipse(center, rx / 2, ry / 2)
    e.stroke = { ...stroke }
    e.fill = resolveFill(fill, e)
    preview = e
  }

  if (preview) {
    ctx.scene.root.addChild(preview)
    ctx.render()
  }
}

export function handleDrawEnd(pos: Vector2, ctx: DrawContext): void {
  if (!dragStart) return
  // Finalize — preview is already in scene, just stop tracking
  if (preview) {
    preview = null
  }
  dragStart = null
  ctx.render()
}

// ---------------------------------------------------------------------------
// Part 3: Polyline click-based tool
// ---------------------------------------------------------------------------

let polylinePoints: Vector2[] = []
let polylinePreview: Polyline | null = null

export function handlePolylineClick(pos: Vector2, ctx: DrawContext): void {
  if (ctx.toolState.activeTool !== 'polyline') return
  polylinePoints.push(pos)

  if (polylinePreview) ctx.scene.root.removeChild(polylinePreview)
  polylinePreview = new Polyline([...polylinePoints])
  polylinePreview.stroke = { ...ctx.toolState.stroke }
  ctx.scene.root.addChild(polylinePreview)
  ctx.render()
}

export function handlePolylineDblClick(ctx: DrawContext): void {
  if (ctx.toolState.activeTool !== 'polyline') return
  if (polylinePoints.length >= 3 && polylinePreview) {
    polylinePreview.isClosed = true
    polylinePreview.fill = resolveFill(ctx.toolState.fill, polylinePreview)
  }
  polylinePreview = null
  polylinePoints = []
  ctx.render()
}

// ---------------------------------------------------------------------------
// Part 3b: Path click-based tool
// ---------------------------------------------------------------------------

let pathBuilder: Path | null = null
let pathLastPoint: Vector2 | null = null
let pathDragStart: Vector2 | null = null
let pathHasPreview = false

export function handlePathDown(pos: Vector2, ctx: DrawContext): void {
  if (ctx.toolState.activeTool !== 'path') return
  if (!pathBuilder) {
    pathBuilder = new Path()
    pathBuilder.moveTo(pos)
    pathBuilder.stroke = { ...ctx.toolState.stroke }
    pathBuilder.fill = ctx.toolState.fill ? { ...ctx.toolState.fill } : null
    ctx.scene.root.addChild(pathBuilder)
    pathLastPoint = pos
    ctx.render()
  } else {
    pathDragStart = pos
    pathHasPreview = false
  }
}

export function handlePathDrag(pos: Vector2, ctx: DrawContext): void {
  if (ctx.toolState.activeTool !== 'path') return
  if (!pathBuilder || !pathDragStart) return

  if (pathHasPreview) {
    pathBuilder.segments.pop()
  }
  pathBuilder.segments.push({ type: 'quadraticTo', control: pos, point: pathDragStart })
  pathHasPreview = true
  ctx.render()
}

export function handlePathUp(pos: Vector2, ctx: DrawContext): void {
  if (ctx.toolState.activeTool !== 'path') return
  if (!pathBuilder || !pathDragStart) return

  if (pathHasPreview) {
    pathBuilder.segments.pop()
  }

  const dragDist = Math.sqrt(
    (pos.x - pathDragStart.x) ** 2 + (pos.y - pathDragStart.y) ** 2,
  )
  if (pathHasPreview && dragDist > 3) {
    pathBuilder.quadraticTo(pos, pathDragStart)
  } else {
    pathBuilder.lineTo(pathDragStart)
  }

  pathLastPoint = pathDragStart
  pathDragStart = null
  pathHasPreview = false
  ctx.render()
}

export function handlePathDblClick(ctx: DrawContext): void {
  if (ctx.toolState.activeTool !== 'path') return
  if (pathBuilder && pathBuilder.segments.length >= 3) {
    pathBuilder.close()
    pathBuilder.fill = resolveFill(ctx.toolState.fill, pathBuilder)
  }
  pathBuilder = null
  pathLastPoint = null
  pathDragStart = null
  pathHasPreview = false
  ctx.render()
}

// ---------------------------------------------------------------------------
// Part 4: Text click tool
// ---------------------------------------------------------------------------

export function handleTextClick(pos: Vector2, ctx: DrawContext): void {
  if (ctx.toolState.activeTool !== 'text') return
  const content = prompt('Text content:')
  if (!content) return
  const t = new Text(content, pos, 24)
  t.fill = ctx.toolState.fill ? { ...ctx.toolState.fill } : { type: 'solid', color: ctx.toolState.stroke.color }
  t.stroke = { ...ctx.toolState.stroke, width: 0 }
  ctx.scene.root.addChild(t)
  ctx.render()
}

// ---------------------------------------------------------------------------
// Part 5: Cancel function
// ---------------------------------------------------------------------------

export function cancelDraw(ctx: DrawContext): void {
  if (preview) {
    ctx.scene.root.removeChild(preview)
    preview = null
  }
  dragStart = null
  if (polylinePreview && polylinePoints.length < 2) {
    ctx.scene.root.removeChild(polylinePreview)
  }
  polylinePreview = null
  polylinePoints = []
  pathBuilder = null
  pathLastPoint = null
  pathDragStart = null
  pathHasPreview = false
}
